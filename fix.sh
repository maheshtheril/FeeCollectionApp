sed -i 's/provider = "postgresql"/provider = "postgresql"\n  url = env("DATABASE_URL")/g' /root/FeeCollectionApp/prisma/schema.prisma
cd /root/FeeCollectionApp
sed -i 's/10.255.255.254/localhost/g' .env

cat << 'EOF' > seed-user.ts
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const password = await hash('hms2035', 12)
  const user = await prisma.user.upsert({
    where: { email: 'feecollectionapp' },
    update: {
      password
    },
    create: {
      email: 'feecollectionapp',
      name: 'Admin',
      password
    }
  })
  console.log({ user })
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
EOF

npx prisma db push
npx prisma generate
npx tsx seed-user.ts
