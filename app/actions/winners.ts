'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/app/lib/prisma'
import { getUser } from '@/app/lib/dal'
import { notifyPaymentApproved } from '@/app/lib/email'

export type WinnerActionState = { error?: string; success?: boolean }

export async function approveWinner(id: string) {
  const user = await getUser()
  if (user?.role !== 'admin') return

  await prisma.winner.update({
    where: { id },
    data: { adminStatus: 'approved' },
  })
  revalidatePath('/admin/winners')
}

export async function rejectWinner(id: string) {
  const user = await getUser()
  if (user?.role !== 'admin') return

  await prisma.winner.update({
    where: { id },
    data: { adminStatus: 'rejected' },
  })
  revalidatePath('/admin/winners')
}

export async function markPaid(id: string) {
  const user = await getUser()
  if (user?.role !== 'admin') return

  const winner = await prisma.winner.update({
    where: { id },
    data: { paymentStatus: 'paid' },
    include: { drawResult: true },
  })

  notifyPaymentApproved(winner.userId, Number(winner.drawResult.prizeAmount))

  revalidatePath('/admin/winners')
}
