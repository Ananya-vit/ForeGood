'use server'

import { redirect } from 'next/navigation'
import { verifySession } from '@/app/lib/dal'
import { createOrder, verifyPaymentSignature, createSubscription } from '@/app/lib/razorpay'
import type { PlanType } from '@/app/lib/razorpay'

export async function createRazorpayOrder(plan: PlanType) {
  const session = await verifySession()
  const order = await createOrder(plan, session.userId)
  return order
}

export async function confirmPayment(formData: FormData) {
  const session = await verifySession()
  const razorpayOrderId = formData.get('razorpay_order_id') as string
  const razorpayPaymentId = formData.get('razorpay_payment_id') as string
  const razorpaySignature = formData.get('razorpay_signature') as string
  const plan = formData.get('plan') as PlanType

  const valid = verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)
  if (!valid) {
    throw new Error('Payment verification failed')
  }

  await createSubscription(session.userId, plan, razorpayOrderId, razorpayPaymentId)
  redirect('/dashboard')
}
