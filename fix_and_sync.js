const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  await prisma.enrollment.update({
    where: { id: 'cmqxjxcr90003l8045d2dmrfv' },
    data: { status: 'ACTIVE' }
  });
  console.log("Set enrollment to ACTIVE.");
}
main().catch(console.error).finally(()=>prisma.$disconnect());
