const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('password123', 10);
  await prisma.user.updateMany({
    data: { password: hash }
  });
  console.log("ALL passwords reset to: password123");
}
main().catch(console.error).finally(()=>prisma.$disconnect());
