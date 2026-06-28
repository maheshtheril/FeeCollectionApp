const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const invoices = await prisma.invoice.findMany({
    where: { description: { contains: "Subscription" } }
  });
  
  let count = 0;
  for (const inv of invoices) {
    const newDesc = inv.description
      .replace("Subscription Fee", "Fee")
      .replace("Subscription", "Fee")
      .replace("MONTHLY", "Monthly");
    await prisma.invoice.update({
      where: { id: inv.id },
      data: { description: newDesc }
    });
    count++;
  }
  console.log(`Updated ${count} invoices.`);
}
main().catch(console.error).finally(()=>prisma.$disconnect());
