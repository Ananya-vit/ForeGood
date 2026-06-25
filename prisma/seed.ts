import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const FIRST_NAMES = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Pranav', 'Dhruv', 'Krishna', 'Aryan',
  'Shaurya', 'Yash', 'Ayaan', 'Ansh', 'Reyansh', 'Laksh', 'Atharv', 'Aarush', 'Tanay', 'Rudra',
  'Anaya', 'Diya', 'Myra', 'Sara', 'Aadhya', 'Ishita', 'Yashvi', 'Anika', 'Ananya', 'Aarushi',
  'Navya', 'Riya', 'Siya', 'Jiya', 'Ira', 'Anvi', 'Shanaya', 'Saanvi', 'Rhea', 'Ishika',
  'Arav', 'Kian', 'Rayan', 'Kabir', 'Rohan', 'Arush', 'Dev', 'Yuvraj', 'Parth', 'Veer',
  'Alisha', 'Kiara', 'Prisha', 'Tanya', 'Sneha', 'Priya', 'Ritu', 'Kavya', 'Nisha', 'Pooja',
  'Ravi', 'Suresh', 'Rajesh', 'Deepak', 'Manish', 'Vijay', 'Sunil', 'Amit', 'Rahul', 'Nitin',
  'Priyanka', 'Neha', 'Shreya', 'Divya', 'Pooja', 'Anjali', 'Swati', 'Komal', 'Radhika', 'Meera',
  'Ramesh', 'Siddharth', 'Vikas', 'Ajay', 'Harsh', 'Mohan', 'Sachin', 'Gaurav', 'Naveen', 'Tarun',
  'Lata', 'Usha', 'Asha', 'Geeta', 'Neetu', 'Shweta', 'Kiran', 'Rohini', 'Madhu', 'Rekha',
]

const LAST_NAMES = [
  'Sharma', 'Patel', 'Singh', 'Kumar', 'Gupta', 'Reddy', 'Verma', 'Joshi', 'Chopra', 'Mehta',
  'Agarwal', 'Jain', 'Saxena', 'Khanna', 'Kapoor', 'Desai', 'Pillai', 'Rao', 'Nair', 'Iyer',
]

const CHURCH_NAMES = [
  'Hope Foundation', 'Grace Community Trust', 'Light of Love Charity', 'Sahyog Foundation',
  'Uday Foundation', 'Prakash Trust', 'Seva Mandir', 'Anandghar', 'Snehalaya', 'Asha Kiran',
]

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

function matchCount(userNumbers: number[], winningNumbers: number[]): number {
  return userNumbers.filter((n) => n > 0 && winningNumbers.includes(n)).length
}

async function main() {
  console.log('Clearing existing data...')
  await prisma.$executeRawUnsafe('TRUNCATE TABLE winners, draw_results, scores, subscriptions, draws, charities, "users" CASCADE')

  console.log('Seeding charities...')
  const charities = await Promise.all(
    CHURCH_NAMES.map((name, i) =>
      prisma.charity.create({
        data: {
          name,
          description: `A dedicated non-profit working towards community welfare and social impact through sustainable initiatives.`,
          imageUrl: `https://picsum.photos/seed/${i + 1}/800/400`,
          website: `https://${name.toLowerCase().replace(/\s+/g, '-')}.org`,
          featured: i < 4,
        },
      })
    )
  )
  console.log(`  ${charities.length} charities created`)

  console.log('Seeding charity events...')
  const eventTitles = ['Annual Golf Day', 'Community Outreach', 'Fundraising Gala', 'Awareness Walk', 'Kids Sports Camp']
  let eventCount = 0
  for (const c of charities) {
    const numEvents = Math.floor(Math.random() * 3) + 1
    for (let i = 0; i < numEvents; i++) {
      const d = new Date()
      d.setDate(d.getDate() + Math.floor(Math.random() * 90) + 10)
      await prisma.charityEvent.create({
        data: {
          charityId: c.id,
          title: pick(eventTitles),
          description: `An event organised by ${c.name} to support community initiatives.`,
          date: d,
          location: ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Chennai'][Math.floor(Math.random() * 5)],
        },
      })
      eventCount++
    }
  }
  console.log(`  ${eventCount} events created`)

  console.log('Seeding users...')
  const password = await bcrypt.hash('password123', 10)
  const users: { id: string; role: string; email: string }[] = []
  const REGULAR_COUNT = 250

  const adminNames = ['Admin Rajesh', 'Admin Priya', 'Admin Vikram']
  for (let i = 0; i < 3; i++) {
    const user = await prisma.user.create({
      data: {
        name: adminNames[i],
        email: `admin${i + 1}@xsam.in`,
        passwordHash: password,
        role: 'admin',
      },
    })
    users.push({ ...user, email: `admin${i + 1}@xsam.in` })
  }

  for (let i = 1; i <= REGULAR_COUNT; i++) {
    const first = FIRST_NAMES[(i - 1) % FIRST_NAMES.length]
    const last = LAST_NAMES[(i - 1) % LAST_NAMES.length]
    const user = await prisma.user.create({
      data: {
        name: `${first} ${last}`,
        email: `user${i}@xsam.in`,
        passwordHash: password,
      },
    })
    users.push({ ...user, email: `user${i}@xsam.in` })
  }
  console.log(`  ${users.length} users created (3 admins, ${REGULAR_COUNT} regular)`)

  console.log('Seeding subscriptions...')
  const now = new Date()
  const subscribedUsers = pickN(users.slice(3), 150)
  const subData = subscribedUsers.map((user) => {
    const isYearly = Math.random() < 0.3
    const periodEnd = isYearly
      ? new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())
      : new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())
    const charity = Math.random() < 0.7 ? pick(charities) : null
    const charityPct = charity ? Math.min(100, Math.max(10, Math.round(Math.random() * 30 + 10))) : 10

    return {
      userId: user.id,
      plan: isYearly ? 'yearly' : 'monthly',
      status: Math.random() < 0.85 ? 'active' : 'canceled',
      stripeSubscriptionId: `pay_seed_${user.id.slice(0, 8)}`,
      currentPeriodEnd: periodEnd,
      charityId: charity?.id ?? null,
      charityPct,
    }
  })

  await prisma.subscription.createMany({ data: subData })
  console.log(`  ${subData.length} subscriptions created`)

  console.log('Seeding scores...')
  const today = new Date()
  const scoreData: { userId: string; score: number; date: Date }[] = []

  // Distribution: users 1-80 get 5 scores, 81-130 get 3-4, 131-170 get 1-2, 171-250 get 0
  // subscribedUsers only includes users 1-150 (those who can have scores)
  const subscribedIds = new Set(subscribedUsers.map((u) => u.id))
  const userScoresMap = new Map<string, { score: number; date: Date }[]>()

  for (const user of subscribedUsers) {
    const userIndex = users.indexOf(user)
    const idx = userIndex - 3 // 0-based regular user index

    let numScores: number
    if (idx < 80) numScores = 5
    else if (idx < 130) numScores = 3 + Math.floor(Math.random() * 2)
    else if (idx < 170) numScores = 1 + Math.floor(Math.random() * 2)
    else numScores = 0

    const usedDates = new Set<string>()
    const userScores: { score: number; date: Date }[] = []

    for (let i = 0; i < numScores; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - Math.floor(Math.random() * 60))
      const key = d.toISOString().split('T')[0]
      if (usedDates.has(key)) continue
      usedDates.add(key)

      // Stableford range 10-45 (realistic golf scores)
      const score = 10 + Math.floor(Math.random() * 35)
      scoreData.push({ userId: user.id, score, date: d })
      userScores.push({ score, date: d })
    }

    userScoresMap.set(user.id, userScores)
  }

  for (let i = 0; i < scoreData.length; i += 100) {
    await prisma.score.createMany({ data: scoreData.slice(i, i + 100) })
  }
  console.log(`  ${scoreData.length} scores created`)

  console.log('Seeding draws...')
  const draws = await Promise.all([
    prisma.draw.create({
      data: {
        month: 11, year: 2025, status: 'completed', drawType: 'random', poolPct: 25,
        winningNumbers: [8, 15, 22, 31, 40],
        prizePool5: 45000, prizePool4: 12000, prizePool3: 4000, jackpotRollover: 0,
      },
    }),
    prisma.draw.create({
      data: {
        month: 12, year: 2025, status: 'completed', drawType: 'random', poolPct: 25,
        winningNumbers: [3, 12, 19, 28, 37],
        prizePool5: 0, prizePool4: 15000, prizePool3: 5000, jackpotRollover: 52000,
      },
    }),
    prisma.draw.create({
      data: {
        month: 1, year: 2026, status: 'completed', drawType: 'algorithmic', poolPct: 25,
        winningNumbers: [5, 14, 20, 33, 42],
        prizePool5: 60000, prizePool4: 18000, prizePool3: 6000, jackpotRollover: 0,
      },
    }),
    prisma.draw.create({
      data: { month: 2, year: 2026, status: 'completed', drawType: 'random', poolPct: 25,
        winningNumbers: [7, 11, 18, 25, 35],
        prizePool5: 0, prizePool4: 14000, prizePool3: 4500, jackpotRollover: 48000,
      },
    }),
    prisma.draw.create({
      data: { month: 3, year: 2026, status: 'pending', drawType: 'random', poolPct: 30 },
    }),
  ])
  console.log(`  ${draws.length} draws created`)

  console.log('Seeding draw results...')
  let resultCount = 0
  const completedDraws = draws.filter((d) => d.status === 'completed')
  const allDrawResults: { id: string; userId: string; matchType: number; drawId: string }[] = []

  for (const draw of completedDraws) {
    const winning = draw.winningNumbers

    // Participants from subscribed users who have >= 3 scores
    const eligible = subscribedUsers.filter((u) => (userScoresMap.get(u.id) || []).length >= 3)
    const participants = pickN(eligible, 20 + Math.floor(Math.random() * 15))

    for (const user of participants) {
      // Random match type (independent of actual score matching) for demo data
      const matchType = (Math.random() < 0.03 ? 5 : Math.random() < 0.10 ? 4 : Math.random() < 0.30 ? 3 : 0) as 0 | 3 | 4 | 5
      if (matchType < 3) continue

      // Use real scores as user numbers, padded with 0s
      const raw = (userScoresMap.get(user.id) || []).map((s) => s.score).sort((a, b) => a - b)
      const numbers = [...raw]
      while (numbers.length < 5) numbers.push(0)

      let prizeAmount = 0
      if (matchType === 3) prizeAmount = Math.floor(Number(draw.prizePool3) / Math.max(1, Math.floor(participants.length * 0.3)))
      else if (matchType === 4) prizeAmount = Math.floor(Number(draw.prizePool4) / Math.max(1, Math.floor(participants.length * 0.1)))
      else if (matchType === 5) prizeAmount = Math.floor(Number(draw.prizePool5) / Math.max(1, 1))

      const result = await prisma.drawResult.create({
        data: {
          drawId: draw.id,
          userId: user.id,
          matchType,
          prizeAmount,
          status: 'paid',
          userNumbers: numbers,
        },
      })
      allDrawResults.push(result)
      resultCount++
    }
  }
  console.log(`  ${resultCount} draw results created`)

  console.log('Seeding winners...')
  let winnerCount = 0

  // Create winners for matchType >= 3 (consistent with runDraw behavior)
  const allWinnable = allDrawResults.filter((r) => r.matchType >= 3)
  for (const r of allWinnable) {
    const isHighTier = r.matchType >= 4
    const hasProof = isHighTier && (r.matchType === 5 || Math.random() < 0.5)
    await prisma.winner.create({
      data: {
        drawResultId: r.id,
        userId: r.userId,
        adminStatus: pick(['approved', 'pending']),
        paymentStatus: pick(['paid', 'pending']),
        proofUrl: hasProof
          ? `https://picsum.photos/seed/${r.id.slice(0, 8)}/400/300`
          : null,
      },
    })
    winnerCount++
  }
  console.log(`  ${winnerCount} winners created`)

  console.log('')
  console.log('═══════════════════════════════════════')
  console.log('  Seed complete!')
  console.log('')
  console.log('  Admins:')
  console.log('    admin1@xsam.in')
  console.log('    admin2@xsam.in')
  console.log('    admin3@xsam.in')
  console.log('')
  console.log('  Sample users:')
  console.log('    user1@xsam.in')
  console.log('    user2@xsam.in')
  console.log('    user3@xsam.in')
  console.log('')
  console.log('  Password for all: password123')
  console.log(`  ${users.length} users, ${subData.length} subscriptions, ${scoreData.length} scores`)
  console.log(`  ${charities.length} charities, ${draws.length} draws, ${resultCount} results, ${winnerCount} winners`)
  console.log('═══════════════════════════════════════')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
