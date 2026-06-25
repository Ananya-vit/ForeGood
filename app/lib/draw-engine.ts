import { prisma } from './prisma'
import { notifyDrawWinner } from './email'

const NUM_COUNT = 5
const NUM_RANGE = parseInt(process.env.DRAW_NUM_RANGE || '45', 10)

function randomNumbers(count: number, max: number): number[] {
  const nums = new Set<number>()
  while (nums.size < count) {
    nums.add(Math.floor(Math.random() * max) + 1)
  }
  return [...nums].sort((a, b) => a - b)
}

function matchCount(userNumbers: number[], winningNumbers: number[]): number {
  return userNumbers.filter((n) => winningNumbers.includes(n)).length
}

export async function generateDrawNumbers(): Promise<number[]> {
  return randomNumbers(NUM_COUNT, NUM_RANGE)
}

export async function assignUserNumbers(userId: string): Promise<number[]> {
  const scores = await prisma.score.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: 5,
    select: { score: true },
  })

  const numbers = scores.map((s) => s.score).sort((a, b) => a - b)

  // pad to exactly 5 with 0s (0 never matches winning numbers 1–45)
  while (numbers.length < 5) {
    numbers.push(0)
  }

  return numbers
}

export async function calculatePrizePools(drawId: string) {
  const draw = await prisma.draw.findUnique({
    where: { id: drawId },
    include: { drawResults: true },
  })
  if (!draw) throw new Error('Draw not found')

  const activeSubs = await prisma.subscription.findMany({
    where: { status: 'active' },
    select: { plan: true },
  })

  const monthlyRevenue = activeSubs.reduce((sum, s) => {
    return sum + (s.plan === 'yearly' ? 500 : 599)
  }, 0)

  const totalPool = Math.round(monthlyRevenue * (draw.poolPct / 100))
  const prizePool5 = Math.round(totalPool * 0.4)
  const prizePool4 = Math.round(totalPool * 0.35)
  const prizePool3 = Math.round(totalPool * 0.25)

  const winner5 = draw.drawResults.filter((r) => r.matchType === 5)
  const winner4 = draw.drawResults.filter((r) => r.matchType === 4)
  const winner3 = draw.drawResults.filter((r) => r.matchType === 3)

  await prisma.draw.update({
    where: { id: drawId },
    data: {
      prizePool5: prizePool5,
      prizePool4: prizePool4,
      prizePool3: prizePool3,
      jackpotRollover: winner5.length === 0 ? prizePool5 : 0,
    },
  })

  if (winner5.length > 0) {
    const each = Math.floor(prizePool5 / winner5.length)
    for (const r of winner5) {
      await prisma.drawResult.update({
        where: { id: r.id },
        data: { prizeAmount: each },
      })
    }
  }
  if (winner4.length > 0) {
    const each = Math.floor(prizePool4 / winner4.length)
    for (const r of winner4) {
      await prisma.drawResult.update({
        where: { id: r.id },
        data: { prizeAmount: each },
      })
    }
  }
  if (winner3.length > 0) {
    const each = Math.floor(prizePool3 / winner3.length)
    for (const r of winner3) {
      await prisma.drawResult.update({
        where: { id: r.id },
        data: { prizeAmount: each },
      })
    }
  }

  return { prizePool5, prizePool4, prizePool3, jackpotRollover: draw.jackpotRollover }
}

export async function runDraw(drawId: string) {
  const draw = await prisma.draw.findUnique({ where: { id: drawId } })
  if (!draw || draw.status !== 'pending') throw new Error('Invalid draw')

  const winningNumbers = await generateDrawNumbers()

  const activeUsers = await prisma.subscription.findMany({
    where: { status: 'active' },
    select: { userId: true },
  })

  const drawResults = []
  for (const { userId } of activeUsers) {
    const userNumbers = await assignUserNumbers(userId)
    const realCount = userNumbers.filter((n) => n > 0).length
    if (realCount < 3) continue // no chance of matching 3+

    const matches = matchCount(userNumbers, winningNumbers)

    if (matches >= 3) {
      const result = await prisma.drawResult.create({
        data: { drawId, userId, matchType: matches, prizeAmount: 0, status: 'pending', userNumbers },
      })

      const adminStatus = 'pending'
      await prisma.winner.create({
        data: { drawResultId: result.id, userId, adminStatus, paymentStatus: 'pending' },
      })

      drawResults.push(result)
    }
  }

  await prisma.draw.update({
    where: { id: drawId },
    data: { winningNumbers, status: 'simulated' },
  })

  await calculatePrizePools(drawId)

  return { winningNumbers, drawResults }
}

export async function publishDraw(drawId: string) {
  const draw = await prisma.draw.findUnique({ where: { id: drawId } })
  if (!draw || draw.status !== 'simulated') throw new Error('Draw must be simulated first')

  await prisma.draw.update({
    where: { id: drawId },
    data: { status: 'completed' },
  })

  const labeled = `${draw.month}/${draw.year}`
  const resultsWithPrizes = await prisma.drawResult.findMany({
    where: { drawId, matchType: { gte: 3 } },
  })
  for (const r of resultsWithPrizes) {
    await notifyDrawWinner(r.userId, labeled, r.matchType, Number(r.prizeAmount))
  }
}
