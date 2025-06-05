import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'

const prisma = new PrismaClient()

async function seed() {
  const raw = fs.readFileSync('backup.json', 'utf-8')
  const data = JSON.parse(raw)

  // 1. Create Accounts first
  for (const account of data.accounts) {
    const { members, configurations, Automation, ...accountData } = account
    await prisma.account.create({ data: accountData })
  }

  // 2. Create Members (without nested AccountMember)
  for (const member of data.members) {
    const { accounts, ...memberData } = member
    await prisma.member.create({ data: memberData })
  }

  // 3. Create AccountMember separately (after both Accounts and Members exist)
  for (const am of data.accountMembers) {
    await prisma.accountMember.create({
      data: {
        accountId: am.accountId,
        memberId: am.memberId,
        status: am.status,
        scope: am.scope,
        createdAt: am.createdAt,
        updatedAt: am.updatedAt
      }
    })
  }

  // 4. Create Integrations
  for (const integration of data.integrations) {
    const { configuraions, ...integrationData } = integration
    await prisma.integration.create({ data: integrationData })
  }

  // 5. Create Configurations
  for (const config of data.configurations) {
    await prisma.configurations.create({ data: config })
  }

  // 6. Create Automations with nested UserProgress
  for (const automation of data.automations) {
    const { UserProgress, ...automationData } = automation
    await prisma.automation.create({
      data: {
        ...automationData,
        UserProgress: {
          create: UserProgress.map((progress: any) => ({
            userId: progress.userId,
            trigger: progress.trigger,
            createdAt: progress.createdAt,
            updatedAt: progress.updatedAt
          }))
        }
      }
    })
  }

  console.log('✅ Seed complete.')
}

seed().catch((e) => {
  console.error('❌ Seeding failed:', e)
}).finally(async () => {
  await prisma.$disconnect()
})
