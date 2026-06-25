'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/app/lib/prisma'
import { getUser } from '@/app/lib/dal'
import { ScoreFormSchema } from '@/app/lib/definitions'

export async function toggleUserRole(userId: string) {
  const admin = await getUser()
  if (admin?.role !== 'admin') return

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return

  await prisma.user.update({
    where: { id: userId },
    data: { role: user.role === 'admin' ? 'user' : 'admin' },
  })
  revalidatePath('/admin/users')
}

export async function updateUserProfile(_prev: unknown, formData: FormData): Promise<{ success?: boolean; error?: string }> {
  const admin = await getUser()
  if (admin?.role !== 'admin') return { error: 'Unauthorized' }

  const userId = formData.get('userId') as string
  const name = formData.get('name') as string
  const email = formData.get('email') as string

  if (!name || !email) return { error: 'Name and email required' }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing && existing.id !== userId) return { error: 'Email already in use' }

  await prisma.user.update({ where: { id: userId }, data: { name, email } })
  revalidatePath('/admin/users')
  return { success: true }
}

export async function adminAddScore(_prev: unknown, formData: FormData): Promise<{ success?: boolean; error?: string }> {
  const admin = await getUser()
  if (admin?.role !== 'admin') return { error: 'Unauthorized' }

  const userId = formData.get('userId') as string
  const parsed = ScoreFormSchema.safeParse({
    score: formData.get('score'),
    date: formData.get('date'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { score, date } = parsed.data
  const dateObj = new Date(date)

  const existing = await prisma.score.findUnique({
    where: { userId_date: { userId, date: dateObj } },
  })
  if (existing) return { error: 'Score already recorded for this date' }

  await prisma.score.create({ data: { userId, score, date: dateObj } })
  revalidatePath('/admin/users')
  return { success: true }
}

export async function adminUpdateScore(_prev: unknown, formData: FormData): Promise<{ success?: boolean; error?: string }> {
  const admin = await getUser()
  if (admin?.role !== 'admin') return { error: 'Unauthorized' }

  const id = formData.get('id') as string
  const parsed = ScoreFormSchema.safeParse({
    score: formData.get('score'),
    date: formData.get('date'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { score, date } = parsed.data
  const dateObj = new Date(date)
  const existing = await prisma.score.findUnique({ where: { id } })
  if (!existing) return { error: 'Score not found' }

  const dup = await prisma.score.findUnique({
    where: { userId_date: { userId: existing.userId, date: dateObj } },
  })
  if (dup && dup.id !== id) return { error: 'Another score already exists for this date' }

  await prisma.score.update({ where: { id }, data: { score, date: dateObj } })
  revalidatePath('/admin/users')
  return { success: true }
}

export async function adminDeleteScore(id: string) {
  const admin = await getUser()
  if (admin?.role !== 'admin') return
  await prisma.score.delete({ where: { id } }).catch(() => {})
  revalidatePath('/admin/users')
}

export async function cancelSubscription(subscriptionId: string) {
  const admin = await getUser()
  if (admin?.role !== 'admin') return

  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: { status: 'cancelled' },
  })
  revalidatePath('/admin/users')
}
