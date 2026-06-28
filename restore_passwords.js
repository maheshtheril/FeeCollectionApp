const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.user.update({
    where: { email: 'maheshtheril@live.com' },
    data: { password: '$2a$10$0jGo5Qb/hDiHPZonQ/efxOjkQpGC/dLGKfMa0a5hTeSvMc/Bo116e' }
  });
  
  await prisma.user.update({
    where: { email: 'test@gmail.com' },
    data: { password: '$2a$10$5LeAPhLarNZOO80gOC/H2.MJIkNp4JfCticMiJ1BD1sCHb2d3JYGO' }
  });

  await prisma.user.update({
    where: { email: 'test1@gmail.com' },
    data: { password: '$2a$10$tAkKnJODX9ZMQQxTmHaeBOqP3vgrM61Tb4hiwjdGlvbTnlGsARXky' }
  });
  
  console.log("Passwords successfully restored!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
