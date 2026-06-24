import Razorpay from 'razorpay'
import { prisma } from './prisma'

export const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export const PLANS = {
  monthly: { amount: 59900, currency: 'INR', description: 'Monthly subscription' },
  yearly: { amount: 599900, currency: 'INR', description: 'Yearly subscription' },
} as const

export type PlanType = keyof typeof PLANS

export async function createOrder(plan: PlanType, userId: string) {
  const planConfig = PLANS[plan]
  const receipt = `sub_${userId.slice(0, 8)}_${Date.now()}`

  const order = await razorpay.orders.create({
    amount: planConfig.amount,
    currency: planConfig.currency,
    receipt,
    notes: { userId, plan },
  })

  return {
    id: order.id,
    amount: order.amount,
    currency: order.currency,
  }
}

export async function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
) {
  const expected = Razorpay.validateWebhookSignature(
    JSON.stringify({ order_id: orderId, payment_id: paymentId }),
    signature,
    process.env.RAZORPAY_KEY_SECRET!
  )
  return expected
}

export async function createSubscription(
  userId: string,
  plan: PlanType,
  razorpayOrderId: string,
  razorpayPaymentId: string
) {
  const now = new Date()
  const periodEnd =
    plan === 'yearly'
      ? new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())
      : new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())

  const existing = await prisma.subscription.findFirst({
    where: { userId, status: 'active' },
  })

  if (existing) {
    return await prisma.subscription.update({
      where: { id: existing.id },
      data: {
        plan,
        status: 'active',
        stripeSubscriptionId: razorpayPaymentId,
        currentPeriodEnd: periodEnd,
      },
    })
  }

  return await prisma.subscription.create({
    data: {
      userId,
      plan,
      status: 'active',
      stripeSubscriptionId: razorpayPaymentId,
      currentPeriodEnd: periodEnd,
    },
  })
}
