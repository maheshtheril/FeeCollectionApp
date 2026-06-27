import prisma from '../src/lib/prisma'
import bcrypt from 'bcryptjs'

async function main() {
  // Create a default organization
  const acme = await prisma.organization.upsert({
    where: { slug: 'acme' },
    update: {},
    create: {
      name: 'Acme Corp',
      slug: 'acme',
    },
  })

  // Hash password
  const hashedPassword = await bcrypt.hash('password123', 10)

  // Create an admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@acme.com' },
    update: {},
    create: {
      email: 'admin@acme.com',
      name: 'Acme Admin',
      password: hashedPassword,
      organizations: {
        create: {
          role: 'ADMIN',
          organizationId: acme.id,
        }
      }
    },
  })

  console.log({ acme, admin })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
