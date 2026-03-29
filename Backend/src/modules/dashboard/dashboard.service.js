const { prisma } = require('../../config/database');

// ── Internal: property access filter ─────────────────────────────────────────

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

// ── Internal: current ledger month string ─────────────────────────────────────

const getCurrentLedgerMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

// ── Main Dashboard ────────────────────────────────────────────────────────────

const getDashboard = async (user) => {
  const accessibleIds = await getAccessiblePropertyIds(user);

  if (accessibleIds !== null && accessibleIds.length === 0) {
    return buildEmptyDashboard();
  }

  const propertyWhere = { is_active: true };
  if (accessibleIds !== null) propertyWhere.id = { in: accessibleIds };

  const agreementWhere = { status: 'ACTIVE' };
  if (accessibleIds !== null) agreementWhere.property_id = { in: accessibleIds };

  const ledgerMonth = getCurrentLedgerMonth();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const next7Days = new Date(today);
  next7Days.setDate(next7Days.getDate() + 7);

  const next30Days = new Date(today);
  next30Days.setDate(next30Days.getDate() + 30);

  const [
    // Property stats
    totalProperties,
    rentedProperties,
    vacantProperties,

    // Agreement stats
    activeAgreements,
    expiringIn30Days,

    // Current month ledger stats
    currentMonthLedgers,
    currentMonthCollected,

    // Overdue
    overdueCount,
    overdueAmount,

    // Upcoming dues in 7 days
    upcomingDues,

    // Recent payments (last 5)
    recentPayments,

    // Active properties detail
    activePropertiesDetail,
  ] = await Promise.all([

    // ── Property counts ───────────────────────────────────────────────────────
    prisma.properties.count({ where: propertyWhere }),

    prisma.properties.count({ where: { ...propertyWhere, status: 'RENTED' } }),

    prisma.properties.count({ where: { ...propertyWhere, status: 'VACANT' } }),

    // ── Agreement counts ──────────────────────────────────────────────────────
    prisma.agreements.count({ where: agreementWhere }),

    prisma.agreements.count({
      where: {
        ...agreementWhere,
        end_date: { gte: today, lte: next30Days },
      },
    }),

    // ── Current month ledger summary ──────────────────────────────────────────
    prisma.rent_ledgers.aggregate({
      where: {
        ledger_month: ledgerMonth,
        agreements: { status: 'ACTIVE' },
        ...(accessibleIds !== null && { property_id: { in: accessibleIds } }),
      },
      _sum: { total_due: true, paid_amount: true, balance_carried: true },
      _count: true,
    }),

    prisma.payments.aggregate({
      where: {
        received_on: {
          gte: new Date(today.getFullYear(), today.getMonth(), 1),
          lte: new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59),
        },
        ...(accessibleIds !== null && { property_id: { in: accessibleIds } }),
      },
      _sum: { amount: true },
      _count: true,
    }),

    // ── Overdue ───────────────────────────────────────────────────────────────
    prisma.rent_ledgers.count({
      where: {
        status: 'OVERDUE',
        agreements: { status: 'ACTIVE' },
        ...(accessibleIds !== null && { property_id: { in: accessibleIds } }),
      },
    }),

    prisma.rent_ledgers.aggregate({
      where: {
        status: 'OVERDUE',
        agreements: { status: 'ACTIVE' },
        ...(accessibleIds !== null && { property_id: { in: accessibleIds } }),
      },
      _sum: { balance_carried: true },
    }),

    // ── Upcoming dues next 7 days ─────────────────────────────────────────────
    prisma.rent_ledgers.findMany({
      where: {
        status: { in: ['PENDING', 'PARTIAL'] },
        due_date: { gte: today, lte: next7Days },
        agreements: { status: 'ACTIVE' },
        ...(accessibleIds !== null && { property_id: { in: accessibleIds } }),
      },
      orderBy: { due_date: 'asc' },
      take: 10,
      include: {
        properties: { select: { id: true, name: true } },
        tenants: { select: { id: true, full_name: true, email: true, whats_app_no: true } },
        agreements: { select: { id: true, monthly_rent: true } },
      },
    }),

    // ── Recent payments ───────────────────────────────────────────────────────
    prisma.payments.findMany({
      where: {
        ...(accessibleIds !== null && { property_id: { in: accessibleIds } }),
      },
      orderBy: { received_on: 'desc' },
      take: 5,
      include: {
        properties: { select: { id: true, name: true } },
        tenants: { select: { id: true, full_name: true } },
        rent_ledgers: { select: { id: true, ledger_month: true, status: true } },
      },
    }),

    // ── Active properties with full current details ────────────────────────────
    prisma.properties.findMany({
      where: { ...propertyWhere, status: 'RENTED' },
      orderBy: { name: 'asc' },
      include: {
        property_types: { select: { id: true, name: true } },
        agreements: {
          where: { status: 'ACTIVE' },
          take: 1,
          include: {
            tenants: {
              select: {
                id: true,
                full_name: true,
                email: true,
                whats_app_no: true,
              },
            },
            brokers: {
              select: { id: true, name: true, contact_no: true },
            },
            deposit_payments: {
              select: { id: true, amount: true, received_on: true, payment_mode: true },
            },
          },
        },
      },
    }),
  ]);

  // ── Current month per-status breakdown ────────────────────────────────────
  const currentMonthStatusBreakdown = await prisma.rent_ledgers.groupBy({
    by: ['status'],
    where: {
      ledger_month: ledgerMonth,
      agreements: { status: 'ACTIVE' },
      ...(accessibleIds !== null && { property_id: { in: accessibleIds } }),
    },
    _count: true,
    _sum: { total_due: true, paid_amount: true, balance_carried: true },
  });

  // ── Vacant properties ─────────────────────────────────────────────────────
  const vacantPropertiesDetail = await prisma.properties.findMany({
    where: { ...propertyWhere, status: 'VACANT' },
    orderBy: { name: 'asc' },
    include: {
      property_types: { select: { id: true, name: true } },
      agreements: {
        where: { status: { in: ['EXPIRED', 'TERMINATED'] } },
        orderBy: { end_date: 'desc' },
        take: 1,
        select: {
          id: true,
          end_date: true,
          status: true,
          tenants: { select: { id: true, full_name: true } },
        },
      },
    },
  });

  // ── Agreements expiring in 30 days detail ─────────────────────────────────
  const expiringAgreementsDetail = await prisma.agreements.findMany({
    where: {
      ...agreementWhere,
      end_date: { gte: today, lte: next30Days },
    },
    orderBy: { end_date: 'asc' },
    include: {
      properties: { select: { id: true, name: true, address: true } },
      tenants: { select: { id: true, full_name: true, email: true, whats_app_no: true } },
    },
  });

  // ── Build current month summary ───────────────────────────────────────────
  const statusMap = {};
  currentMonthStatusBreakdown.forEach((row) => {
    statusMap[row.status] = {
      count: row._count,
      totalDue: parseFloat(row._sum.total_due || 0),
      paidAmount: parseFloat(row._sum.paid_amount || 0),
      balance: parseFloat(row._sum.balance_carried || 0),
    };
  });

  return {
    // ── Snapshot ───────────────────────────────────────────────────────────
    snapshot: {
      totalProperties,
      rentedProperties,
      vacantProperties,
      activeAgreements,
      expiringIn30Days,
      overdueCount,
      overdueAmount: parseFloat(overdueAmount._sum.balance_carried || 0),
    },

    // ── Current Month ──────────────────────────────────────────────────────
    currentMonth: {
      ledgerMonth,
      totalExpected: parseFloat(currentMonthLedgers._sum.total_due || 0),
      totalCollected: parseFloat(currentMonthCollected._sum.amount || 0),
      totalOutstanding: parseFloat(currentMonthLedgers._sum.balance_carried || 0),
      totalLedgers: currentMonthLedgers._count,
      collectionTransactions: currentMonthCollected._count,
      collectionRate:
        currentMonthLedgers._sum.total_due > 0
          ? parseFloat(
              (
                (parseFloat(currentMonthCollected._sum.amount || 0) /
                  parseFloat(currentMonthLedgers._sum.total_due)) *
                100
              ).toFixed(2)
            )
          : 0,
      statusBreakdown: statusMap,
    },

    // ── Upcoming Dues (next 7 days) ────────────────────────────────────────
    upcomingDues: upcomingDues.map((ledger) => ({
      ledgerId: ledger.id,
      ledgerMonth: ledger.ledger_month,
      dueDate: ledger.due_date,
      totalDue: parseFloat(ledger.total_due),
      paidAmount: parseFloat(ledger.paid_amount),
      balanceCarried: parseFloat(ledger.balance_carried),
      status: ledger.status,
      property: ledger.properties,
      tenant: ledger.tenants,
      agreement: ledger.agreements,
    })),

    // ── Expiring Agreements ────────────────────────────────────────────────
    expiringAgreements: expiringAgreementsDetail.map((a) => ({
      id: a.id,
      startDate: a.start_date,
      endDate: a.end_date,
      monthlyRent: parseFloat(a.monthly_rent),
      durationMonths: a.duration_months,
      daysRemaining: Math.ceil(
        (new Date(a.end_date) - today) / (1000 * 60 * 60 * 24)
      ),
      property: a.properties,
      tenant: a.tenants,
    })),

    // ── Recent Payments ────────────────────────────────────────────────────
    recentPayments: recentPayments.map((p) => ({
      id: p.id,
      amount: parseFloat(p.amount),
      paymentMode: p.payment_mode,
      receivedOn: p.received_on,
      isAdvance: p.is_advance,
      property: p.properties,
      tenant: p.tenants,
      ledger: p.rent_ledgers,
    })),

    // ── Rented Properties Detail ───────────────────────────────────────────
    rentedProperties: activePropertiesDetail.map((property) => {
      const agreement = property.agreements[0] || null;
      return {
        id: property.id,
        name: property.name,
        address: property.address,
        areaSqFt: parseFloat(property.area_sq_ft),
        propertyType: property.property_types,
        agreement: agreement
          ? {
              id: agreement.id,
              startDate: agreement.start_date,
              endDate: agreement.end_date,
              monthlyRent: parseFloat(agreement.monthly_rent),
              rentDueDay: agreement.rent_due_day,
              depositAmount: parseFloat(agreement.deposit_amount),
              durationMonths: agreement.duration_months,
              tenant: agreement.tenants,
              broker: agreement.brokers,
              deposit: agreement.deposit_payments,
            }
          : null,
      };
    }),

    // ── Vacant Properties Detail ───────────────────────────────────────────
    vacantProperties: vacantPropertiesDetail.map((property) => {
      const lastAgreement = property.agreements[0] || null;
      return {
        id: property.id,
        name: property.name,
        address: property.address,
        areaSqFt: parseFloat(property.area_sq_ft),
        propertyType: property.property_types,
        lastAgreement: lastAgreement
          ? {
              id: lastAgreement.id,
              endDate: lastAgreement.end_date,
              status: lastAgreement.status,
              lastTenant: lastAgreement.tenants,
            }
          : null,
      };
    }),
  };
};

const buildEmptyDashboard = () => ({
  snapshot: {
    totalProperties: 0,
    rentedProperties: 0,
    vacantProperties: 0,
    activeAgreements: 0,
    expiringIn30Days: 0,
    overdueCount: 0,
    overdueAmount: 0,
  },
  currentMonth: {
    ledgerMonth: getCurrentLedgerMonth(),
    totalExpected: 0,
    totalCollected: 0,
    totalOutstanding: 0,
    totalLedgers: 0,
    collectionTransactions: 0,
    collectionRate: 0,
    statusBreakdown: {},
  },
  upcomingDues: [],
  expiringAgreements: [],
  recentPayments: [],
  rentedProperties: [],
  vacantProperties: [],
});

module.exports = { getDashboard };