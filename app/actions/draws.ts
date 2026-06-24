'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/app/lib/prisma'
import { getUser } from '@/app/lib/dal'
import { runDraw } from '@/app/lib/draw-engine'

export type DrawActionState = { error?: string; success?: boolean }

export async function createDraw(prevState: DrawActionState, formData: FormData): Promise<DrawActionState> {
  const user = await getUser()
  if (user?.role !== 'admin') return { error: 'Unauthorized' }

  const month = parseInt(formData.get('month') as string)
  const year = parseInt(formData.get('year') as string)
  const drawType = (formData.get('drawType') as string) || 'random'

  if (!month || !year) return { error: 'Month and year required' }

  const existing = await prisma.draw.findUnique({
    where: { month_year: { month, year } },
  })
  if (existing) return { error: 'Draw already exists for this month' }

  await prisma.draw.create({
    data: { month, year, drawType, status: 'pending' },
  })

  revalidatePath('/admin/draws')
  return { success: true }
}

export async function executeDraw(drawId: string) {
  const user = await getUser()
  if (user?.role !== 'admin') return { error: 'Unauthorized' }

  try {
    const result = await runDraw(drawId)
    revalidatePath('/admin/draws')
    return { success: true, ...result }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Draw failed' }
  }
}
