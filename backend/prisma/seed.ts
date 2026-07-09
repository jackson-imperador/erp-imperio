import { PrismaClient, UserRole, CompanyStatus, SubscriptionStatus, SubscriptionInterval } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // ── Plans ──────────────────────────────────────────────────
  const starterPlan = await prisma.plan.upsert({
    where: { id: 'plan-starter' },
    update: {},
    create: {
      id: 'plan-starter',
      name: 'Starter',
      description: 'For small businesses getting started',
      price: 99.90,
      interval: SubscriptionInterval.MONTHLY,
      trialDays: 14,
      maxUsers: 3,
      maxProducts: 100,
      maxCustomers: 200,
      maxStorageMb: 512,
      maxBranches: 1,
    },
  });

  const proPlan = await prisma.plan.upsert({
    where: { id: 'plan-pro' },
    update: {},
    create: {
      id: 'plan-pro',
      name: 'Pro',
      description: 'For growing businesses',
      price: 299.90,
      interval: SubscriptionInterval.MONTHLY,
      trialDays: 14,
      maxUsers: 15,
      maxProducts: 1000,
      maxCustomers: 5000,
      maxStorageMb: 5120,
      maxBranches: 3,
    },
  });

  const enterprisePlan = await prisma.plan.upsert({
    where: { id: 'plan-enterprise' },
    update: {},
    create: {
      id: 'plan-enterprise',
      name: 'Enterprise',
      description: 'For large organizations',
      price: 999.90,
      interval: SubscriptionInterval.MONTHLY,
      trialDays: 30,
      maxUsers: 9999,
      maxProducts: 999999,
      maxCustomers: 999999,
      maxStorageMb: 102400,
      maxBranches: 99,
    },
  });

  // ── Demo Company ────────────────────────────────────────────
  const company = await prisma.company.upsert({
    where: { slug: 'demo-empresa' },
    update: {},
    create: {
      id: 'company-demo',
      name: 'Empresa Demo Ltda',
      slug: 'demo-empresa',
      document: '00.000.000/0001-00',
      email: 'contato@demo.com',
      status: CompanyStatus.ACTIVE,
      timezone: 'America/Sao_Paulo',
      locale: 'pt-BR',
      currencyCode: 'BRL',
    },
  });

  // ── Subscription ────────────────────────────────────────────
  await prisma.subscription.upsert({
    where: { companyId: company.id },
    update: {},
    create: {
      companyId: company.id,
      planId: proPlan.id,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  // ── Super Admin User ────────────────────────────────────────
  const passwordHash = await bcrypt.hash('Admin@123456', 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@imperio.erp' },
    update: {},
    create: {
      email: 'admin@imperio.erp',
      passwordHash,
      firstName: 'Super',
      lastName: 'Admin',
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
    },
  });

  await prisma.userCompany.upsert({
    where: { userId_companyId: { userId: superAdmin.id, companyId: company.id } },
    update: {},
    create: {
      userId: superAdmin.id,
      companyId: company.id,
      role: UserRole.COMPANY_OWNER,
      isDefault: true,
    },
  });

  // ── Demo Manager User ───────────────────────────────────────
  const managerHash = await bcrypt.hash('Manager@123456', 12);

  const manager = await prisma.user.upsert({
    where: { email: 'gerente@demo.com' },
    update: {},
    create: {
      email: 'gerente@demo.com',
      passwordHash: managerHash,
      firstName: 'Carlos',
      lastName: 'Gerente',
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
    },
  });

  await prisma.userCompany.upsert({
    where: { userId_companyId: { userId: manager.id, companyId: company.id } },
    update: {},
    create: {
      userId: manager.id,
      companyId: company.id,
      role: UserRole.MANAGER,
      isDefault: true,
    },
  });

  // ── Financial Categories ────────────────────────────────────
  await prisma.financialCategory.createMany({
    skipDuplicates: true,
    data: [
      { id: 'cat-receita', type: 'INCOME', name: 'Receitas', isSystem: true },
      { id: 'cat-vendas', type: 'INCOME', name: 'Vendas de Produtos', parentId: 'cat-receita', isSystem: true },
      { id: 'cat-despesa', type: 'EXPENSE', name: 'Despesas', isSystem: true },
      { id: 'cat-aluguel', type: 'EXPENSE', name: 'Aluguel', parentId: 'cat-despesa', isSystem: true },
      { id: 'cat-fornecedor', type: 'EXPENSE', name: 'Compras de Fornecedores', parentId: 'cat-despesa', isSystem: true },
      { id: 'cat-salario', type: 'EXPENSE', name: 'Folha de Pagamento', parentId: 'cat-despesa', isSystem: true },
    ],
  });

  // ── Default Warehouse ───────────────────────────────────────
  await prisma.warehouse.upsert({
    where: { id: 'warehouse-main' },
    update: {},
    create: {
      id: 'warehouse-main',
      companyId: company.id,
      name: 'Depósito Principal',
      description: 'Almoxarifado central',
      isDefault: true,
      isActive: true,
    },
  });

  // ── Demo Category ───────────────────────────────────────────
  await prisma.category.upsert({
    where: { companyId_slug: { companyId: company.id, slug: 'geral' } },
    update: {},
    create: {
      companyId: company.id,
      name: 'Geral',
      slug: 'geral',
      description: 'Categoria geral de produtos',
    },
  });

  console.log('✅ Seed completed successfully!');
  console.log('');
  console.log('👤 Users created:');
  console.log('   Super Admin: admin@imperio.erp / Admin@123456');
  console.log('   Manager:     gerente@demo.com / Manager@123456');
  console.log('');
  console.log('🏢 Company: Empresa Demo Ltda (demo-empresa)');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
