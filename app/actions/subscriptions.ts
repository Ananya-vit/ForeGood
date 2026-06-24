'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { decrypt } from '@/app/lib/session'
import { createOrder, verifyPaymentSignature, createSubscription } from '@/app/lib/razorpay'
import type { PlanType } from '@/app/lib/razorpay'

export async function createRazorpayOrder(plan: PlanType) {
  const cookie = (await cookies()).get('session')?.value
  const session = await decrypt(cookie)
  if (!session?.userId) {
    return { error: 'unauthorized' }
  }

  try {
    const order = await createOrder(plan, session.userId)
    return order
  } catch {
    return { error: 'payment_provider' }
  }
}

export async function confirmPayment(formData: FormData) {
  const cookie = (await cookies()).get('session')?.value
  const session = await decrypt(cookie)
  if (!session?.userId) redirect('/login')

  const razorpayOrderId = formData.get('razorpay_order_id') as string
  const razorpayPaymentId = formData.get('razorpay_payment_id') as string
  const razorpaySignature = formData.get('razorpay_signature') as string
  const plan = formData.get('plan') as PlanType

  const valid = verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)
  if (!valid) {
    throw new Error('Payment verification failed')
  }

  await createSubscription(session!.userId, plan, razorpayOrderId, razorpayPaymentId)
  redirect('/dashboard')
}
