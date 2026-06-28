const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  await prisma.user.update({
    where: { email: 'test1@gmail.com' },
    data: { password: hashedPassword }
  });
  
  console.log("Password successfully reset to 'password123' for test1@gmail.com");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
