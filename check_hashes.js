const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany();
  console.log(users.map(u => ({id: u.id, email: u.email, pass: u.password})));
}
main().catch(console.error).finally(()=>prisma.$disconnect());
