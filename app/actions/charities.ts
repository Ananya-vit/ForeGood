'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/app/lib/prisma'
import { getUser } from '@/app/lib/dal'

const CharitySchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  description: z.string().optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  featured: z.coerce.boolean(),
})

export type CharityActionState = { error?: string; success?: boolean }

export async function createCharity(prevState: CharityActionState, formData: FormData): Promise<CharityActionState> {
  const user = await getUser()
  if (user?.role !== 'admin') return { error: 'Unauthorized' }

  const parsed = CharitySchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  await prisma.charity.create({ data: parsed.data })
  revalidatePath('/admin/charities')
  return { success: true }
}

export async function updateCharity(prevState: CharityActionState, formData: FormData): Promise<CharityActionState> {
  const user = await getUser()
  if (user?.role !== 'admin') return { error: 'Unauthorized' }

  const id = formData.get('id') as string
  if (!id) return { error: 'Missing id' }

  const parsed = CharitySchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  await prisma.charity.update({ where: { id }, data: parsed.data })
  revalidatePath('/admin/charities')
  return { success: true }
}

export async function deleteCharity(id: string) {
  const user = await getUser()
  if (user?.role !== 'admin') return

  await prisma.charity.delete({ where: { id } })
  revalidatePath('/admin/charities')
}

export async function selectCharity(prevState: CharityActionState | undefined, formData: FormData): Promise<CharityActionState> {
  const user = await getUser()
  if (!user) return { error: 'Not authenticated' }

  const charityId = formData.get('charityId') as string
  const charityPct = parseInt(formData.get('charityPct') as string) || 10

  const sub = await prisma.subscription.findFirst({
    where: { userId: user.id, status: 'active' },
  })
  if (!sub) return { error: 'No active subscription' }

  await prisma.subscription.update({
    where: { id: sub.id },
    data: { charityId: charityId || null, charityPct: Math.max(10, Math.min(100, charityPct)) },
  })

  revalidatePath('/dashboard/settings')
  return { success: true }
}
