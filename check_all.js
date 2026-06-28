const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const students = await prisma.student.findMany({
    include: {
      enrollments: {
        include: {
          invoices: true,
          course: true
        }
      }
    }
  });
  
  for (const s of students) {
    console.log(`Student: ${s.name} (${s.id})`);
    for (const e of s.enrollments) {
      console.log(`  Enrollment: ${e.course.name} - Status: ${e.status} - Start: ${e.currentPeriodStart} - End: ${e.currentPeriodEnd}`);
      for (const i of e.invoices) {
        console.log(`    Invoice: ${i.amount} - ${i.status} - ${i.description}`);
      }
    }
  }
}
main().catch(console.error).finally(()=>prisma.$disconnect());
