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

export async function submitProof(prevState: WinnerActionState, formData: FormData): Promise<WinnerActionState> {
  const user = await getUser()
  if (!user) return { error: 'Not authenticated' }

  const winnerId = formData.get('winnerId') as string
  const file = formData.get('proofImage') as File | null

  if (!file || file.size === 0) {
    return { error: 'Please select a screenshot to upload' }
  }

  if (!file.type.startsWith('image/')) {
    return { error: 'Only image files are accepted (PNG, JPG, etc.)' }
  }

  // 5MB limit
  if (file.size > 5 * 1024 * 1024) {
    return { error: 'File too large. Maximum 5MB.' }
  }

  const winner = await prisma.winner.findUnique({ where: { id: winnerId } })
  if (!winner || winner.userId !== user.id) return { error: 'Winner not found' }

  const buffer = Buffer.from(await file.arrayBuffer())
  const ext = file.name.split('.').pop() || 'png'
  const fileName = `${winnerId}-${Date.now()}.${ext}`

  let proofUrl: string
  try {
    const { uploadProofImage } = await import('@/app/lib/storage')
    proofUrl = await uploadProofImage(buffer, file.type, fileName)
  } catch {
    return { error: 'Failed to upload image. Check storage configuration.' }
  }

  await prisma.winner.update({
    where: { id: winnerId },
    data: { proofUrl },
  })

  revalidatePath('/dashboard')
  return { success: true }
}

export async function markPaid(id: string) {
  const user = await getUser()
  if (user?.role !== 'admin') return

  const winner = await prisma.winner.update({
    where: { id },
    data: { paymentStatus: 'paid' },
    include: { drawResult: true },
  })

  await notifyPaymentApproved(winner.userId, Number(winner.drawResult.prizeAmount))

  revalidatePath('/admin/winners')
}
