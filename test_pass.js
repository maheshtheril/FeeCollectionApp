const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({where:{email:'test1@gmail.com'}});
  if (!user) {
    console.log("User not found!");
    return;
  }
  const match = await bcrypt.compare('password123', user.password);
  console.log('Match:', match);
  console.log('DB hash:', user.password);
}
main().catch(console.error).finally(()=>prisma.$disconnect());
