const { prisma } = require('../../config/database');
const AppError = require('../../utils/AppError');
const { getPagination, getPaginationMeta } = require('../../utils/pagination');

// ── Internal: property access filter for USER role ────────────────────────────

const getAccessiblePropertyIds = async (user) => {
  if (user.role === 'ADMIN') return null;

  const accessList = await prisma.user_property_access.findMany({
    where: {
      user_id: user.id,
      is_active: true,
      valid_from: { lte: new Date() },
      valid_to: { gte: new Date() },
    },
    select: { property_id: true },
  });

  return accessList.map((a) => a.property_id);
};

// ── 1. Overall Portfolio Summary ──────────────────────────────────────────────

const getPortfolioSummary = async (user) => {
  const accessibleIds = await getAccessiblePropertyIds(user);

  const propertyWhere = { is_active: true };
  if (accessibleIds !== null) {
    if (accessibleIds.length === 0) return buildEmptyPortfolio();
    propertyWhere.id = { in: accessibleIds };
  }

  const [
    totalProperties,
    rentedProperties,
    vacantProperties,
    activeAgreements,
    totalRentCollected,
    pendingBalance,
    overdueCount,
  ] = await Promise.all([
    prisma.properties.count({ where: propertyWhere }),

    prisma.properties.count({ where: { ...propertyWhere, status: 'RENTED' } }),

    prisma.properties.count({ where: { ...propertyWhere, status: 'VACANT' } }),

    prisma.agreements.count({
      where: {
        status: 'ACTIVE',
        ...(accessibleIds !== null && { property_id: { in: accessibleIds } }),
      },
    }),

    prisma.payments.aggregate({
      where: {
        ...(accessibleIds !== null && { property_id: { in: accessibleIds } }),
      },
      _sum: { amount: true },
    }),

    prisma.rent_ledgers.aggregate({
      where: {
        status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] },
        agreements: { status: 'ACTIVE' },
        ...(accessibleIds !== null && { property_id: { in: accessibleIds } }),
      },
      _sum: { balance_carried: true },
    }),

    prisma.rent_ledgers.count({
      where: {
        status: 'OVERDUE',
        agreements: { status: 'ACTIVE' },
        ...(accessibleIds !== null && { property_id: { in: accessibleIds } }),
      },
    }),
  ]);

  return {
    totalProperties,
    rentedProperties,
    vacantProperties,
    activeAgreements,
    totalRentCollected: parseFloat(totalRentCollected._sum.amount || 0),
    totalPendingBalance: parseFloat(pendingBalance._sum.balance_carried || 0),
    overdueCount,
  };
};

const buildEmptyPortfolio = () => ({
  totalProperties: 0,
  rentedProperties: 0,
  vacantProperties: 0,
  activeAgreements: 0,
  totalRentCollected: 0,
  totalPendingBalance: 0,
  overdueCount: 0,
});

// ── 2. Property-wise Full History Report ──────────────────────────────────────

const getPropertyReport = async (propertyId, user) => {
  const accessibleIds = await getAccessiblePropertyIds(user);

  if (accessibleIds !== null && !accessibleIds.includes(propertyId)) {
    throw new AppError('You do not have access to this property.', 403);
  }

  const property = await prisma.properties.findUnique({
    where: { id: propertyId },
    include: {
      property_types: { select: { id: true, name: true } },
    },
  });

  if (!property) throw new AppError('Property not found.', 404);

  const agreements = await prisma.agreements.findMany({
    where: { property_id: propertyId },
    orderBy: { start_date: 'desc' },
    include: {
      tenants: {
        select: {
          id: true,
          full_name: true,
          email: true,
          whats_app_no: true,
          permanent_address: true,
        },
      },
      brokers: {
        select: { id: true, name: true, contact_no: true },
      },
      deposit_payments: true,
      brokerage_payments: true,
      agreement_rent_cycles: {
        orderBy: { cycle_number: 'asc' },
      },
    },
  });

  // Financials per agreement
  const agreementReports = await Promise.all(
    agreements.map(async (agreement) => {
      const [totalCollected, totalDue, pendingLedgers, paidLedgers, partialLedgers, overdueLedgers] =
        await Promise.all([
          prisma.payments.aggregate({
            where: { agreement_id: agreement.id },
            _sum: { amount: true },
          }),
          prisma.rent_ledgers.aggregate({
            where: { agreement_id: agreement.id },
            _sum: { total_due: true },
          }),
          prisma.rent_ledgers.count({
            where: { agreement_id: agreement.id, status: 'PENDING' },
          }),
          prisma.rent_ledgers.count({
            where: { agreement_id: agreement.id, status: 'PAID' },
          }),
          prisma.rent_ledgers.count({
            where: { agreement_id: agreement.id, status: 'PARTIAL' },
          }),
          prisma.rent_ledgers.count({
            where: { agreement_id: agreement.id, status: 'OVERDUE' },
          }),
        ]);

      return {
        ...agreement,
        financials: {
          totalRentDue: parseFloat(totalDue._sum.total_due || 0),
          totalCollected: parseFloat(totalCollected._sum.amount || 0),
          outstandingBalance: parseFloat(
            (totalDue._sum.total_due || 0) - (totalCollected._sum.amount || 0)
          ),
          ledgerStats: {
            pending: pendingLedgers,
            paid: paidLedgers,
            partial: partialLedgers,
            overdue: overdueLedgers,
          },
        },
      };
    })
  );

  // Property lifetime totals
  const lifetimeTotals = await prisma.payments.aggregate({
    where: { property_id: propertyId },
    _sum: { amount: true },
    _count: true,
  });

  const currentAgreement = agreements.find((a) => a.status === 'ACTIVE') || null;

  return {
    property,
    currentAgreement: currentAgreement
      ? {
          id: currentAgreement.id,
          tenant: currentAgreement.tenants,
          startDate: currentAgreement.start_date,
          endDate: currentAgreement.end_date,
          monthlyRent: currentAgreement.monthly_rent,
          durationMonths: currentAgreement.duration_months,
        }
      : null,
    totalAgreements: agreements.length,
    lifetimeTotals: {
      totalRentCollected: parseFloat(lifetimeTotals._sum.amount || 0),
      totalPaymentTransactions: lifetimeTotals._count,
    },
    agreements: agreementReports,
  };
};

// ── 3. Monthly Revenue Report ─────────────────────────────────────────────────

const getMonthlyReport = async (query, user) => {
  const { year, month, propertyId } = query;
  const { page, limit, skip } = getPagination(query);

  if (!year || !month) {
    throw new AppError('Year and month are required for monthly report.', 400);
  }

  const accessibleIds = await getAccessiblePropertyIds(user);
  if (accessibleIds !== null && accessibleIds.length === 0) {
    return buildEmptyMonthlyReport(year, month);
  }

  const ledgerMonth = `${year}-${String(month).padStart(2, '0')}`;

  const ledgerWhere = { ledger_month: ledgerMonth };
  if (accessibleIds !== null) ledgerWhere.property_id = { in: accessibleIds };
  if (propertyId) ledgerWhere.property_id = propertyId;

  const paymentWhere = {};
  if (accessibleIds !== null) paymentWhere.property_id = { in: accessibleIds };
  if (propertyId) paymentWhere.property_id = propertyId;

  const startOfMonth = new Date(parseInt(year), parseInt(month) - 1, 1);
  const endOfMonth = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
  paymentWhere.received_on = { gte: startOfMonth, lte: endOfMonth };

  const [
    ledgerSummary,
    collectionSummary,
    ledgersDetail,
    totalLedgers,
  ] = await Promise.all([
    prisma.rent_ledgers.groupBy({
      by: ['status'],
      where: ledgerWhere,
      _count: true,
      _sum: { total_due: true, paid_amount: true, balance_carried: true },
    }),

    prisma.payments.aggregate({
      where: paymentWhere,
      _sum: { amount: true },
      _count: true,
    }),

    prisma.rent_ledgers.findMany({
      where: ledgerWhere,
      skip,
      take: limit,
      orderBy: { due_date: 'asc' },
      include: {
        properties: { select: { id: true, name: true } },
        tenants: { select: { id: true, full_name: true, email: true, whats_app_no: true } },
        agreements: { select: { id: true, monthly_rent: true, rent_due_day: true } },
        payments: {
          where: { received_on: { gte: startOfMonth, lte: endOfMonth } },
          select: { id: true, amount: true, payment_mode: true, received_on: true },
        },
      },
    }),

    prisma.rent_ledgers.count({ where: ledgerWhere }),
  ]);

  // Summarize ledger stats
  const stats = {
    totalExpected: 0,
    totalCollected: 0,
    totalPending: 0,
    totalOverdue: 0,
    statusBreakdown: {},
  };

  ledgerSummary.forEach((row) => {
    stats.totalExpected += parseFloat(row._sum.total_due || 0);
    stats.statusBreakdown[row.status] = {
      count: row._count,
      totalDue: parseFloat(row._sum.total_due || 0),
      paidAmount: parseFloat(row._sum.paid_amount || 0),
      balance: parseFloat(row._sum.balance_carried || 0),
    };
    if (['PENDING', 'PARTIAL', 'OVERDUE'].includes(row.status)) {
      stats.totalPending += parseFloat(row._sum.balance_carried || 0);
    }
    if (row.status === 'OVERDUE') {
      stats.totalOverdue += parseFloat(row._sum.balance_carried || 0);
    }
  });

  stats.totalCollected = parseFloat(collectionSummary._sum.amount || 0);
  stats.totalPaymentTransactions = collectionSummary._count;

  return {
    period: { year: parseInt(year), month: parseInt(month), ledgerMonth },
    summary: stats,
    ledgers: ledgersDetail,
    meta: getPaginationMeta(totalLedgers, page, limit),
  };
};

const buildEmptyMonthlyReport = (year, month) => ({
  period: { year: parseInt(year), month: parseInt(month) },
  summary: {
    totalExpected: 0,
    totalCollected: 0,
    totalPending: 0,
    totalOverdue: 0,
    statusBreakdown: {},
    totalPaymentTransactions: 0,
  },
  ledgers: [],
  meta: getPaginationMeta(0, 1, 10),
});

// ── 4. Yearly Revenue Report ──────────────────────────────────────────────────

const getYearlyReport = async (query, user) => {
  const { year, propertyId } = query;

  if (!year) throw new AppError('Year is required for yearly report.', 400);

  const accessibleIds = await getAccessiblePropertyIds(user);
  if (accessibleIds !== null && accessibleIds.length === 0) {
    return buildEmptyYearlyReport(year);
  }

  const startOfYear = new Date(parseInt(year), 0, 1);
  const endOfYear = new Date(parseInt(year), 11, 31, 23, 59, 59);

  const paymentWhere = {
    received_on: { gte: startOfYear, lte: endOfYear },
  };
  if (accessibleIds !== null) paymentWhere.property_id = { in: accessibleIds };
  if (propertyId) paymentWhere.property_id = propertyId;

  // Month-by-month breakdown
  const monthlyBreakdown = [];
  for (let m = 1; m <= 12; m++) {
    const ledgerMonth = `${year}-${String(m).padStart(2, '0')}`;
    const monthStart = new Date(parseInt(year), m - 1, 1);
    const monthEnd = new Date(parseInt(year), m, 0, 23, 59, 59);

    const ledgerWhere = { ledger_month: ledgerMonth };
    if (accessibleIds !== null) ledgerWhere.property_id = { in: accessibleIds };
    if (propertyId) ledgerWhere.property_id = propertyId;

    const [ledgerStats, collectionStats] = await Promise.all([
      prisma.rent_ledgers.aggregate({
        where: ledgerWhere,
        _sum: { total_due: true, paid_amount: true, balance_carried: true },
        _count: true,
      }),
      prisma.payments.aggregate({
        where: {
          ...paymentWhere,
          received_on: { gte: monthStart, lte: monthEnd },
        },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    monthlyBreakdown.push({
      month: m,
      ledgerMonth,
      totalDue: parseFloat(ledgerStats._sum.total_due || 0),
      totalCollected: parseFloat(collectionStats._sum.amount || 0),
      totalBalance: parseFloat(ledgerStats._sum.balance_carried || 0),
      ledgerCount: ledgerStats._count,
      paymentTransactions: collectionStats._count,
    });
  }

  // Property-wise totals for the year
  const propertySummary = await prisma.payments.groupBy({
    by: ['property_id'],
    where: paymentWhere,
    _sum: { amount: true },
    _count: true,
  });

  const propertySummaryWithDetails = await Promise.all(
    propertySummary.map(async (row) => {
      const property = await prisma.properties.findUnique({
        where: { id: row.property_id },
        select: { id: true, name: true, address: true },
      });
      return {
        property,
        totalCollected: parseFloat(row._sum.amount || 0),
        totalTransactions: row._count,
      };
    })
  );

  // Year totals
  const yearTotals = await prisma.payments.aggregate({
    where: paymentWhere,
    _sum: { amount: true },
    _count: true,
  });

  const yearDueTotals = await prisma.rent_ledgers.aggregate({
    where: {
      ledger_month: {
        gte: `${year}-01`,
        lte: `${year}-12`,
      },
      ...(accessibleIds !== null && { property_id: { in: accessibleIds } }),
      ...(propertyId && { property_id: propertyId }),
    },
    _sum: { total_due: true, balance_carried: true },
  });

  return {
    year: parseInt(year),
    totals: {
      totalDue: parseFloat(yearDueTotals._sum.total_due || 0),
      totalCollected: parseFloat(yearTotals._sum.amount || 0),
      totalOutstanding: parseFloat(yearDueTotals._sum.balance_carried || 0),
      totalTransactions: yearTotals._count,
    },
    monthlyBreakdown,
    propertySummary: propertySummaryWithDetails,
  };
};

const buildEmptyYearlyReport = (year) => ({
  year: parseInt(year),
  totals: { totalDue: 0, totalCollected: 0, totalOutstanding: 0, totalTransactions: 0 },
  monthlyBreakdown: [],
  propertySummary: [],
});

// ── 5. Lifetime Collection Report ─────────────────────────────────────────────

const getLifetimeReport = async (user) => {
  const accessibleIds = await getAccessiblePropertyIds(user);

  if (accessibleIds !== null && accessibleIds.length === 0) {
    return buildEmptyLifetimeReport();
  }

  const paymentWhere = {};
  const agreementWhere = {};
  const propertyWhere = {};

  if (accessibleIds !== null) {
    paymentWhere.property_id = { in: accessibleIds };
    agreementWhere.property_id = { in: accessibleIds };
    propertyWhere.id = { in: accessibleIds };
  }

  const [
    totalCollected,
    totalAgreements,
    totalTenants,
    totalProperties,
    paymentModeBreakdown,
    yearlyTotals,
    topProperties,
  ] = await Promise.all([
    prisma.payments.aggregate({
      where: paymentWhere,
      _sum: { amount: true },
      _count: true,
    }),

    prisma.agreements.count({ where: agreementWhere }),

    prisma.agreements.groupBy({
      by: ['tenant_id'],
      where: agreementWhere,
    }).then((r) => r.length),

    prisma.properties.count({ where: { ...propertyWhere, is_active: true } }),

    prisma.payments.groupBy({
      by: ['payment_mode'],
      where: paymentWhere,
      _sum: { amount: true },
      _count: true,
    }),

    // Year-by-year totals (group by year)
    prisma.$queryRaw`
      SELECT
        EXTRACT(YEAR FROM received_on)::int AS year,
        SUM(amount)::float AS total_collected,
        COUNT(*)::int AS total_transactions
      FROM payments
      ${accessibleIds !== null
        ? prisma.$queryRaw`WHERE property_id = ANY(${accessibleIds}::uuid[])`
        : prisma.$queryRaw``
      }
      GROUP BY EXTRACT(YEAR FROM received_on)
      ORDER BY year ASC
    `.catch(() => []),

    prisma.payments.groupBy({
      by: ['property_id'],
      where: paymentWhere,
      _sum: { amount: true },
      _count: true,
      orderBy: { _sum: { amount: 'desc' } },
      take: 5,
    }),
  ]);

  const topPropertiesWithDetails = await Promise.all(
    topProperties.map(async (row) => {
      const property = await prisma.properties.findUnique({
        where: { id: row.property_id },
        select: { id: true, name: true, address: true, status: true },
      });
      return {
        property,
        totalCollected: parseFloat(row._sum.amount || 0),
        totalTransactions: row._count,
      };
    })
  );

  return {
    totals: {
      totalRentCollected: parseFloat(totalCollected._sum.amount || 0),
      totalPaymentTransactions: totalCollected._count,
      totalAgreements,
      totalUniqueTenants: totalTenants,
      totalProperties,
    },
    paymentModeBreakdown: paymentModeBreakdown.map((row) => ({
      mode: row.payment_mode,
      totalAmount: parseFloat(row._sum.amount || 0),
      count: row._count,
    })),
    topProperties: topPropertiesWithDetails,
  };
};

const buildEmptyLifetimeReport = () => ({
  totals: {
    totalRentCollected: 0,
    totalPaymentTransactions: 0,
    totalAgreements: 0,
    totalUniqueTenants: 0,
    totalProperties: 0,
  },
  paymentModeBreakdown: [],
  topProperties: [],
});

// ── 6. Tenant History Report ──────────────────────────────────────────────────

const getTenantReport = async (tenantId, user) => {
  const tenant = await prisma.tenants.findUnique({
    where: { id: tenantId },
    select: {
      id: true,
      full_name: true,
      email: true,
      whats_app_no: true,
      dob: true,
      permanent_address: true,
      is_active: true,
      created_at: true,
    },
  });

  if (!tenant) throw new AppError('Tenant not found.', 404);

  const accessibleIds = await getAccessiblePropertyIds(user);

  const agreementWhere = { tenant_id: tenantId };
  if (accessibleIds !== null) {
    agreementWhere.property_id = { in: accessibleIds };
  }

  const agreements = await prisma.agreements.findMany({
    where: agreementWhere,
    orderBy: { start_date: 'desc' },
    include: {
      properties: {
        select: { id: true, name: true, address: true },
      },
      agreement_rent_cycles: { orderBy: { cycle_number: 'asc' } },
      deposit_payments: true,
      brokerage_payments: true,
    },
  });

  const agreementDetails = await Promise.all(
    agreements.map(async (agreement) => {
      const [collected, totalDue, balancePending] = await Promise.all([
        prisma.payments.aggregate({
          where: { agreement_id: agreement.id, tenant_id: tenantId },
          _sum: { amount: true },
          _count: true,
        }),
        prisma.rent_ledgers.aggregate({
          where: { agreement_id: agreement.id },
          _sum: { total_due: true },
        }),
        prisma.rent_ledgers.aggregate({
          where: {
            agreement_id: agreement.id,
            status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] },
          },
          _sum: { balance_carried: true },
        }),
      ]);

      return {
        ...agreement,
        financials: {
          totalDue: parseFloat(totalDue._sum.total_due || 0),
          totalCollected: parseFloat(collected._sum.amount || 0),
          pendingBalance: parseFloat(balancePending._sum.balance_carried || 0),
          totalTransactions: collected._count,
        },
      };
    })
  );

  const lifetimeTotals = await prisma.payments.aggregate({
    where: { tenant_id: tenantId },
    _sum: { amount: true },
    _count: true,
  });

  const activeAgreement = agreements.find((a) => a.status === 'ACTIVE') || null;

  return {
    tenant,
    activeAgreement: activeAgreement
      ? {
          id: activeAgreement.id,
          property: activeAgreement.properties,
          startDate: activeAgreement.start_date,
          endDate: activeAgreement.end_date,
          monthlyRent: activeAgreement.monthly_rent,
          durationMonths: activeAgreement.duration_months,
        }
      : null,
    totalAgreements: agreements.length,
    lifetimeTotals: {
      totalRentCollected: parseFloat(lifetimeTotals._sum.amount || 0),
      totalTransactions: lifetimeTotals._count,
    },
    agreements: agreementDetails,
  };
};

// ── 7. Agreements Expiring Soon ───────────────────────────────────────────────

const getExpiringSoonReport = async (query, user) => {
  const { days = 30 } = query;
  const { page, limit, skip } = getPagination(query);

  const accessibleIds = await getAccessiblePropertyIds(user);
  if (accessibleIds !== null && accessibleIds.length === 0) {
    return { agreements: [], meta: getPaginationMeta(0, 1, limit) };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = new Date(today);
  targetDate.setDate(targetDate.getDate() + parseInt(days));

  const where = {
    status: 'ACTIVE',
    end_date: { gte: today, lte: targetDate },
  };
  if (accessibleIds !== null) where.property_id = { in: accessibleIds };

  const [agreements, total] = await Promise.all([
    prisma.agreements.findMany({
      where,
      skip,
      take: limit,
      orderBy: { end_date: 'asc' },
      include: {
        properties: { select: { id: true, name: true, address: true } },
        tenants: {
          select: { id: true, full_name: true, email: true, whats_app_no: true },
        },
      },
    }),
    prisma.agreements.count({ where }),
  ]);

  return { agreements, meta: getPaginationMeta(total, page, limit) };
};

// ── 8. Overdue Rent Report ────────────────────────────────────────────────────

const getOverdueReport = async (query, user) => {
  const { page, limit, skip } = getPagination(query);
  const { propertyId } = query;

  const accessibleIds = await getAccessiblePropertyIds(user);
  if (accessibleIds !== null && accessibleIds.length === 0) {
    return { ledgers: [], meta: getPaginationMeta(0, 1, limit), totalOverdueAmount: 0 };
  }

  const where = {
    status: 'OVERDUE',
    agreements: { status: 'ACTIVE' },
  };
  if (accessibleIds !== null) where.property_id = { in: accessibleIds };
  if (propertyId) where.property_id = propertyId;

  const [ledgers, total, overdueTotal] = await Promise.all([
    prisma.rent_ledgers.findMany({
      where,
      skip,
      take: limit,
      orderBy: { due_date: 'asc' },
      include: {
        properties: { select: { id: true, name: true, address: true } },
        tenants: {
          select: { id: true, full_name: true, email: true, whats_app_no: true },
        },
        agreements: {
          select: { id: true, monthly_rent: true, rent_due_day: true },
        },
      },
    }),
    prisma.rent_ledgers.count({ where }),
    prisma.rent_ledgers.aggregate({
      where,
      _sum: { balance_carried: true },
    }),
  ]);

  return {
    ledgers,
    meta: getPaginationMeta(total, page, limit),
    totalOverdueAmount: parseFloat(overdueTotal._sum.balance_carried || 0),
  };
};

// ── 9. Property-wise Revenue Summary ─────────────────────────────────────────

const getPropertyRevenueSummary = async (query, user) => {
  const { year } = query;
  const { page, limit, skip } = getPagination(query);

  const accessibleIds = await getAccessiblePropertyIds(user);
  if (accessibleIds !== null && accessibleIds.length === 0) {
    return { properties: [], meta: getPaginationMeta(0, 1, limit) };
  }

  const propertyWhere = { is_active: true };
  if (accessibleIds !== null) propertyWhere.id = { in: accessibleIds };

  const [properties, total] = await Promise.all([
    prisma.properties.findMany({
      where: propertyWhere,
      skip,
      take: limit,
      orderBy: { name: 'asc' },
      include: {
        property_types: { select: { id: true, name: true } },
      },
    }),
    prisma.properties.count({ where: propertyWhere }),
  ]);

  const propertiesWithRevenue = await Promise.all(
    properties.map(async (property) => {
      const paymentWhere = { property_id: property.id };

      if (year) {
        const startOfYear = new Date(parseInt(year), 0, 1);
        const endOfYear = new Date(parseInt(year), 11, 31, 23, 59, 59);
        paymentWhere.received_on = { gte: startOfYear, lte: endOfYear };
      }

      const ledgerWhere = { property_id: property.id };
      if (year) {
        ledgerWhere.ledger_month = {
          gte: `${year}-01`,
          lte: `${year}-12`,
        };
      }

      const [collected, due, activeAgreement, totalAgreements] = await Promise.all([
        prisma.payments.aggregate({
          where: paymentWhere,
          _sum: { amount: true },
          _count: true,
        }),
        prisma.rent_ledgers.aggregate({
          where: ledgerWhere,
          _sum: { total_due: true, balance_carried: true },
        }),
        prisma.agreements.findFirst({
          where: { property_id: property.id, status: 'ACTIVE' },
          select: {
            id: true,
            monthly_rent: true,
            start_date: true,
            end_date: true,
            tenants: { select: { id: true, full_name: true } },
          },
        }),
        prisma.agreements.count({ where: { property_id: property.id } }),
      ]);

      return {
        property,
        activeAgreement,
        totalAgreements,
        revenue: {
          totalDue: parseFloat(due._sum.total_due || 0),
          totalCollected: parseFloat(collected._sum.amount || 0),
          totalOutstanding: parseFloat(due._sum.balance_carried || 0),
          totalTransactions: collected._count,
        },
      };
    })
  );

  return {
    properties: propertiesWithRevenue,
    meta: getPaginationMeta(total, page, limit),
  };
};

module.exports = {
  getPortfolioSummary,
  getPropertyReport,
  getMonthlyReport,
  getYearlyReport,
  getLifetimeReport,
  getTenantReport,
  getExpiringSoonReport,
  getOverdueReport,
  getPropertyRevenueSummary,
};