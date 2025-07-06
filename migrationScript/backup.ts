import 'dotenv/config'
import { writeFileSync } from 'fs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function backup() {
  const data = {
    accounts: await prisma.account.findMany({ include: { members: true, configurations: true} }),
    members: await prisma.member.findMany({ include: { accounts: true } }),
    accountMembers: await prisma.accountMember.findMany(),
    // automations: await prisma.automation.findMany({ include: { UserProgress: true } }),
    // userProgress: await prisma.userProgress.findMany(),
    integrations: await prisma.integration.findMany({ include: { configuraions: true } }),
    configurations: await prisma.configurations.findMany()
  }

  writeFileSync('backup.json', JSON.stringify(data, null, 2))
  console.log('✅ Backup complete. File saved as backup.json')
}

backup().catch(console.error).finally(() => prisma.$disconnect())
