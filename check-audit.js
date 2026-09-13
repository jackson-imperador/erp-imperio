const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const totalSales = await prisma.saleOrder.count();
  const salesWithoutCustomer = await prisma.saleOrder.count({ where: { customerId: null } });
  const salesWithCustomer = await prisma.saleOrder.count({ where: { customerId: { not: null } } });
  
  const query1 = "SELECT COUNT(*) FROM sale_orders so LEFT JOIN customers c ON so.\"customerId\" = c.id WHERE so.\"customerId\" IS NOT NULL AND c.id IS NULL";
  const invalidCIds = await prisma.$queryRawUnsafe(query1);
  const query2 = "SELECT COUNT(*) FROM sale_orders so JOIN customers c ON so.\"customerId\" = c.id WHERE so.\"companyId\" != c.\"companyId\"";
  const invalidCompIds = await prisma.$queryRawUnsafe(query2);
  const customerForTest = await prisma.customer.findFirst({ select: { id: true, name: true, companyId: true } });
  console.log(JSON.stringify({
    totalSales,
    salesWithoutCustomer,
    salesWithCustomer,
    invalidCustomerIds: Number(invalidCIds[0].count),
    invalidCompanyIds: Number(invalidCompIds[0].count),
    customerForTest
  }, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
