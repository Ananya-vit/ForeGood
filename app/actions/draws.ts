'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/app/lib/prisma'
import { getUser } from '@/app/lib/dal'
import { runDraw, publishDraw } from '@/app/lib/draw-engine'

export type DrawActionState = { error?: string; success?: boolean }

export async function createDraw(prevState: DrawActionState, formData: FormData): Promise<DrawActionState> {
  const user = await getUser()
  if (user?.role !== 'admin') return { error: 'Unauthorized' }

  const month = parseInt(formData.get('month') as string)
  const year = parseInt(formData.get('year') as string)
  const drawType = (formData.get('drawType') as string) || 'random'
  const poolPct = parseInt(formData.get('poolPct') as string) || 25

  if (!month || !year) return { error: 'Month and year required' }
  if (poolPct < 1 || poolPct > 100) return { error: 'Pool percentage must be between 1 and 100' }

  const existing = await prisma.draw.findUnique({
    where: { month_year: { month, year } },
  })
  if (existing) return { error: 'Draw already exists for this month' }

  await prisma.draw.create({
    data: { month, year, drawType, status: 'pending', poolPct },
  })

  revalidatePath('/admin/draws')
  return { success: true }
}

export async function executeDraw(drawId: string) {
  const user = await getUser()
  if (user?.role !== 'admin') return { error: 'Unauthorized' }

  try {
    await runDraw(drawId)
    revalidatePath('/admin/draws')
    return { success: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Draw failed' }
  }
}

export async function publishDrawAction(drawId: string) {
  const user = await getUser()
  if (user?.role !== 'admin') return { error: 'Unauthorized' }

  try {
    await publishDraw(drawId)
    revalidatePath('/admin/draws')
    return { success: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Publish failed' }
  }
}

export async function deleteDraw(drawId: string) {
  const user = await getUser()
  if (user?.role !== 'admin') return { error: 'Unauthorized' }

  const draw = await prisma.draw.findUnique({ where: { id: drawId } })
  if (!draw) return { error: 'Draw not found' }
  if (draw.status === 'completed') return { error: 'Cannot delete a completed draw' }

  // Cascade: delete winners, draw results, then draw
  await prisma.winner.deleteMany({ where: { drawResult: { drawId } } })
  await prisma.drawResult.deleteMany({ where: { drawId } })
  await prisma.draw.delete({ where: { id: drawId } })

  revalidatePath('/admin/draws')
  return { success: true }
}

export async function rerunDraw(drawId: string) {
  const user = await getUser()
  if (user?.role !== 'admin') return { error: 'Unauthorized' }

  const draw = await prisma.draw.findUnique({ where: { id: drawId } })
  if (!draw) return { error: 'Draw not found' }
  if (draw.status !== 'simulated' && draw.status !== 'pending') return { error: 'Can only rerun a pending or simulated draw' }

  try {
    // Clear existing results if any
    await prisma.winner.deleteMany({ where: { drawResult: { drawId } } })
    await prisma.drawResult.deleteMany({ where: { drawId } })

    // Reset status to pending, clear old winning numbers
    await prisma.draw.update({
      where: { id: drawId },
      data: { status: 'pending', winningNumbers: [], prizePool5: 0, prizePool4: 0, prizePool3: 0, jackpotRollover: 0 },
    })

    // Re-run
    await runDraw(drawId)
    revalidatePath('/admin/draws')
    return { success: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Rerun failed' }
  }
}
