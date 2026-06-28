const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  await prisma.user.updateMany({
    where: { 
      email: {
        in: ['test1@gmail.com', 'test@gmail.com', 'maheshtheril@live.com']
      }
    },
    data: { password: hashedPassword }
  });
  
  console.log("Passwords successfully reset for ALL admins!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
