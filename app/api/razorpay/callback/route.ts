import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { decrypt } from '@/app/lib/session'
import { verifyPaymentSignature, createSubscription } from '@/app/lib/razorpay'
import type { PlanType } from '@/app/lib/razorpay'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const razorpayOrderId = formData.get('razorpay_order_id') as string
  const razorpayPaymentId = formData.get('razorpay_payment_id') as string
  const razorpaySignature = formData.get('razorpay_signature') as string
  const plan = formData.get('plan') as PlanType

  const cookie = (await cookies()).get('session')?.value
  const session = await decrypt(cookie)

  if (!session?.userId) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const valid = verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)
  if (!valid) {
    return NextResponse.redirect(new URL('/pricing?error=verification_failed', req.url))
  }

  await createSubscription(session.userId, plan, razorpayOrderId, razorpayPaymentId)

  const { notifyWelcome } = await import('@/app/lib/email')
  await notifyWelcome(session.userId, plan)

  return NextResponse.redirect(new URL('/dashboard', req.url))
}
