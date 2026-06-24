import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Clearing existing data...')
  await prisma.winner.deleteMany()
  await prisma.drawResult.deleteMany()
  await prisma.score.deleteMany()
  await prisma.subscription.deleteMany()
  await prisma.charity.deleteMany()
  await prisma.draw.deleteMany()
  await prisma.user.deleteMany()

  console.log('Seeding users...')
  const password = await bcrypt.hash('password123', 10)
  const admin = await prisma.user.create({
    data: { name: 'Admin User', email: 'admin@example.com', passwordHash: password, role: 'admin' },
  })
  const alice = await prisma.user.create({
    data: { name: 'Alice Golfer', email: 'alice@example.com', passwordHash: password },
  })
  const bob = await prisma.user.create({
    data: { name: 'Bob Driver', email: 'bob@example.com', passwordHash: password },
  })
  const charlie = await prisma.user.create({
    data: { name: 'Charlie Putter', email: 'charlie@example.com', passwordHash: password },
  })

  console.log('Seeding charities...')
  const charity1 = await prisma.charity.create({
    data: {
      name: 'Green Earth Foundation',
      description: 'Working to restore natural ecosystems through community-led reforestation and conservation projects across India.',
      website: 'https://example.com/green-earth',
      featured: true,
    },
  })
  const charity2 = await prisma.charity.create({
    data: {
      name: 'Teach for Tomorrow',
      description: 'Providing quality education to underprivileged children in rural communities, one classroom at a time.',
      website: 'https://example.com/teach-tomorrow',
      featured: true,
    },
  })
  const charity3 = await prisma.charity.create({
    data: {
      name: 'Animal Care Trust',
      description: 'Rescuing, rehabilitating, and rehoming stray animals in urban areas.',
      featured: false,
    },
  })

  console.log('Seeding subscriptions...')
  const now = new Date()
  const monthFromNow = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())
  const yearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())

  await prisma.subscription.create({
    data: {
      userId: alice.id, plan: 'monthly', status: 'active',
      stripeSubscriptionId: 'pay_test_alice_001', currentPeriodEnd: monthFromNow,
      charityId: charity1.id, charityPct: 15,
    },
  })
  await prisma.subscription.create({
    data: {
      userId: bob.id, plan: 'yearly', status: 'active',
      stripeSubscriptionId: 'pay_test_bob_001', currentPeriodEnd: yearFromNow,
      charityId: charity2.id, charityPct: 20,
    },
  })

  console.log('Seeding scores...')
  const today = new Date()
  for (let i = 0; i < 5; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    await prisma.score.create({ data: { userId: alice.id, score: 70 + i * 2, date: d } })
    await prisma.score.create({ data: { userId: bob.id, score: 80 + i * 3, date: d } })
  }
  await prisma.score.create({ data: { userId: charlie.id, score: 85, date: today } })

  console.log('Seeding draws...')
  const jan = await prisma.draw.create({
    data: {
      month: 1, year: 2026, status: 'completed', drawType: 'random',
      winningNumbers: [7, 14, 23, 35, 42],
      prizePool5: 50000, prizePool4: 15000, prizePool3: 5000, jackpotRollover: 0,
    },
  })
  const feb = await prisma.draw.create({
    data: {
      month: 2, year: 2026, status: 'completed', drawType: 'random',
      winningNumbers: [3, 11, 19, 28, 47],
      prizePool5: 0, prizePool4: 12000, prizePool3: 4000, jackpotRollover: 55000,
    },
  })

  console.log('Seeding draw results...')
  const r1 = await prisma.drawResult.create({
    data: { drawId: jan.id, userId: alice.id, matchType: 3, prizeAmount: 2500, status: 'paid' },
  })
  const r2 = await prisma.drawResult.create({
    data: { drawId: jan.id, userId: bob.id, matchType: 4, prizeAmount: 15000, status: 'paid' },
  })
  const r3 = await prisma.drawResult.create({
    data: { drawId: feb.id, userId: alice.id, matchType: 3, prizeAmount: 2000, status: 'pending' },
  })

  console.log('Seeding winners...')
  await prisma.winner.create({
    data: { drawResultId: r1.id, userId: alice.id, adminStatus: 'approved', paymentStatus: 'paid', proofUrl: 'https://example.com/proof1' },
  })
  await prisma.winner.create({
    data: { drawResultId: r2.id, userId: bob.id, adminStatus: 'approved', paymentStatus: 'paid' },
  })
  await prisma.winner.create({
    data: { drawResultId: r3.id, userId: alice.id, adminStatus: 'pending', paymentStatus: 'pending' },
  })

  console.log('Seed complete.')
  console.log('---')
  console.log('Login emails: admin@example.com / alice@example.com / bob@example.com / charlie@example.com')
  console.log('Password for all: password123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
