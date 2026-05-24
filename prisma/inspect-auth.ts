// One-off: list local users + their credential-account state. Read-only.
import 'dotenv/config'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from './generated/client.ts'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true, name: true, emailVerified: true, banned: true }
  })
  console.log(`Users in DB (${process.env.DATABASE_URL?.split('@')[1]}): ${users.length}`)
  for (const u of users) {
    console.log(` - ${u.email} | role=${u.role || '(none)'} | verified=${u.emailVerified} | banned=${u.banned}`)
  }

  const baker = users.find(u => u.email === 'baker@xyz.dev')
  if (baker) {
    const accounts = await prisma.account.findMany({
      where: { userId: baker.id },
      select: { providerId: true, password: true }
    })
    console.log()
    console.log('Accounts for baker@xyz.dev:')
    for (const a of accounts) {
      console.log(` - provider=${a.providerId} | hasPassword=${!!a.password} | hashLen=${a.password?.length || 0}`)
    }
  } else {
    console.log()
    console.log('No baker@xyz.dev user found.')
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
