'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/app/lib/prisma'
import { getUser } from '@/app/lib/dal'

const CharitySchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  description: z.string().optional(),
  imageUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  featured: z.coerce.boolean(),
})

export type CharityActionState = { error?: string; success?: boolean }

export async function createCharity(prevState: CharityActionState, formData: FormData): Promise<CharityActionState> {
  const user = await getUser()
  if (user?.role !== 'admin') return { error: 'Unauthorized' }

  const parsed = CharitySchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { imageUrl, ...rest } = parsed.data
  await prisma.charity.create({ data: { ...rest, imageUrl: imageUrl || null } })
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

  const { imageUrl, ...rest } = parsed.data
  await prisma.charity.update({ where: { id }, data: { ...rest, imageUrl: imageUrl || null } })
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

export async function createEvent(prevState: CharityActionState, formData: FormData): Promise<CharityActionState> {
  const user = await getUser()
  if (user?.role !== 'admin') return { error: 'Unauthorized' }

  const charityId = formData.get('charityId') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const date = formData.get('date') as string
  const location = formData.get('location') as string

  if (!charityId || !title || !date) return { error: 'Charity, title, and date required' }

  await prisma.charityEvent.create({
    data: { charityId, title, description: description || null, date: new Date(date), location: location || null },
  })

  revalidatePath('/admin/charities')
  revalidatePath('/charities')
  return { success: true }
}

export async function deleteEvent(id: string) {
  const user = await getUser()
  if (user?.role !== 'admin') return

  await prisma.charityEvent.delete({ where: { id } })
  revalidatePath('/admin/charities')
  revalidatePath('/charities')
}
