// seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // ── Admin User ──────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash('Admin@123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@rautrentals.com' },
    update: {},
    create: {
      name: 'Raut Admin',
      email: 'admin@rautrentals.com',
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log(`✅ Admin seeded: ${admin.email}`);

  // ── Property Types ───────────────────────────────────────────────
  const propertyTypes = [
    { name: 'Residential', description: 'Apartments, flats, bungalows and housing units' },
    { name: 'Shop',        description: 'Retail shops and commercial outlets' },
    { name: 'Office',      description: 'Office spaces and business premises' },
    { name: 'Industrial',  description: 'Factories, plants and industrial units' },
    { name: 'Warehouse',   description: 'Storage and warehousing units' },
    { name: 'Commercial',  description: 'Mixed-use commercial spaces' },
  ];

  for (const pt of propertyTypes) {
    await prisma.propertyType.upsert({
      where: { name: pt.name },
      update: {},
      create: {
        name: pt.name,
        description: pt.description,
        isActive: true,
      },
    });
  }

  console.log(`✅ Property types seeded: ${propertyTypes.map((p) => p.name).join(', ')}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });