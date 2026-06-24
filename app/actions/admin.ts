'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/app/lib/prisma'
import { getUser } from '@/app/lib/dal'

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
