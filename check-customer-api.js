const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const http = require('http');

async function main() {
  // 1. Get real customer data
  const customer = await prisma.customer.findFirst({
    where: { name: { contains: 'jackson', mode: 'insensitive' } }
  });
  console.log('=== CUSTOMER IN DB ===');
  console.log(JSON.stringify(customer, null, 2));

  // 2. Get all customers for the company
  const allCustomers = await prisma.customer.findMany({
    where: { companyId: customer ? customer.companyId : undefined }
  });
  console.log('=== ALL CUSTOMERS FOR COMPANY ===');
  console.log(JSON.stringify(allCustomers.map(c => ({ id: c.id, name: c.name, phone: c.phone, document: c.document, deletedAt: c.deletedAt })), null, 2));

  // 3. Test raw DB search
  const searchResult = await prisma.customer.findMany({
    where: {
      companyId: customer ? customer.companyId : undefined,
      deletedAt: null,
      OR: [
        { name: { contains: 'jackson', mode: 'insensitive' } }
      ]
    }
  });
  console.log('=== DB SEARCH FOR "jackson" ===');
  console.log(JSON.stringify(searchResult, null, 2));
}
main().catch(console.error).finally(() => prisma['']());
