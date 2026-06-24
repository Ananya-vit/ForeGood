'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/app/lib/prisma'
import { getUser } from '@/app/lib/dal'
import { ScoreFormSchema } from '@/app/lib/definitions'

export type ScoreFormState = { error?: string; success?: boolean }

export async function addScore(prevState: ScoreFormState, formData: FormData): Promise<ScoreFormState> {
  const user = await getUser()
  if (!user) return { error: 'Not authenticated' }

  const sub = await prisma.subscription.findFirst({
    where: { userId: user.id, status: 'active' },
  })
  if (!sub) return { error: 'Active subscription required to enter scores' }

  const parsed = ScoreFormSchema.safeParse({
    score: formData.get('score'),
    date: formData.get('date'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { score, date } = parsed.data
  const dateObj = new Date(date)

  const existing = await prisma.score.findUnique({
    where: { userId_date: { userId: user.id, date: dateObj } },
  })
  if (existing) return { error: 'Score already recorded for this date' }

  const count = await prisma.score.count({ where: { userId: user.id } })
  if (count >= 5) {
    const oldest = await prisma.score.findFirst({
      where: { userId: user.id },
      orderBy: { date: 'asc' },
    })
    if (oldest) await prisma.score.delete({ where: { id: oldest.id } })
  }

  await prisma.score.create({ data: { userId: user.id, score, date: dateObj } })
  revalidatePath('/dashboard/scores')
  return { success: true }
}

export async function deleteScore(id: string) {
  const user = await getUser()
  if (!user) return
  const score = await prisma.score.findUnique({ where: { id } })
  if (!score || score.userId !== user.id) return

  await prisma.score.delete({ where: { id } })
  revalidatePath('/dashboard/scores')
}
