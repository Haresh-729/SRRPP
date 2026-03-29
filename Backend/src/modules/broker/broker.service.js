const { prisma } = require('../../config/database');
const AppError = require('../../utils/AppError');
const { getPagination, getPaginationMeta } = require('../../utils/pagination');

// ── Create Broker ─────────────────────────────────────────────────────────────

const createBroker = async (data) => {
  const broker = await prisma.brokers.create({
    data: {
      name: data.name,
      contact_no: data.contactNo,
      email: data.email || null,
      address: data.address || null,
    },
  });

  return broker;
};

// ── Get All Brokers ───────────────────────────────────────────────────────────

const getAllBrokers = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const { search, isActive } = query;

  const where = {};

  if (search) {
    where.OR = [
      { name:       { contains: search, mode: 'insensitive' } },
      { contact_no: { contains: search, mode: 'insensitive' } },
      { email:      { contains: search, mode: 'insensitive' } },
    ];
  }

  if (isActive !== undefined) {
    where.is_active = isActive === 'true';
  }

  const [brokers, total] = await Promise.all([
    prisma.brokers.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      include: {
        _count: {
          select: { agreements: true },
        },
      },
    }),
    prisma.brokers.count({ where }),
  ]);

  return {
    brokers,
    meta: getPaginationMeta(total, page, limit),
  };
};

// ── Get Broker By ID ──────────────────────────────────────────────────────────

const getBrokerById = async (id) => {
  const broker = await prisma.brokers.findUnique({
    where: { id },
    include: {
      agreements: {
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          start_date: true,
          end_date: true,
          monthly_rent: true,
          status: true,
          properties: {
            select: { id: true, name: true, address: true },
          },
          tenants: {
            select: { id: true, full_name: true, email: true, whats_app_no: true },
          },
          brokerage_payments: {
            select: {
              id: true,
              brokerage_type: true,
              brokerage_value: true,
              brokerage_amount: true,
              is_paid: true,
              paid_on: true,
              payment_mode: true,
            },
          },
        },
      },
      _count: {
        select: { agreements: true },
      },
    },
  });

  if (!broker) {
    throw new AppError('Broker not found.', 404);
  }

  return broker;
};

// ── Get Broker Summary (for dropdown) ────────────────────────────────────────

const getBrokerSummary = async () => {
  const brokers = await prisma.brokers.findMany({
    where: { is_active: true },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      contact_no: true,
      email: true,
    },
  });

  return brokers;
};

// ── Update Broker ─────────────────────────────────────────────────────────────

const updateBroker = async (id, data) => {
  const broker = await prisma.brokers.findUnique({ where: { id } });

  if (!broker) {
    throw new AppError('Broker not found.', 404);
  }

  const updated = await prisma.brokers.update({
    where: { id },
    data: {
      ...(data.name      !== undefined && { name:       data.name }),
      ...(data.contactNo !== undefined && { contact_no: data.contactNo }),
      ...(data.email     !== undefined && { email:      data.email || null }),
      ...(data.address   !== undefined && { address:    data.address || null }),
      ...(data.isActive  !== undefined && { is_active:  data.isActive }),
    },
  });

  return updated;
};

// ── Delete Broker ─────────────────────────────────────────────────────────────

const deleteBroker = async (id) => {
  const broker = await prisma.brokers.findUnique({
    where: { id },
    include: {
      _count: { select: { agreements: true } },
    },
  });

  if (!broker) {
    throw new AppError('Broker not found.', 404);
  }

  if (broker._count.agreements > 0) {
    throw new AppError(
      'Cannot delete this broker as they are linked to one or more agreements. Deactivate instead.',
      400
    );
  }

  await prisma.brokers.delete({ where: { id } });
};

module.exports = {
  createBroker,
  getAllBrokers,
  getBrokerById,
  getBrokerSummary,
  updateBroker,
  deleteBroker,
};