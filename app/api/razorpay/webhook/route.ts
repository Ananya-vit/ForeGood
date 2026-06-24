import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { prisma } from '@/app/lib/prisma'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('x-razorpay-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  const valid = Razorpay.validateWebhookSignature(
    body,
    signature,
    process.env.RAZORPAY_WEBHOOK_SECRET!
  )

  if (!valid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const event = JSON.parse(body)

  if (event.event === 'payment.captured') {
    const payment = event.payload.payment.entity
    const userId = payment.notes?.userId
    const plan = payment.notes?.plan

    if (userId && plan) {
      const now = new Date()
      const periodEnd =
        plan === 'yearly'
          ? new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())
          : new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())

      const existing = await prisma.subscription.findFirst({
        where: { userId, status: 'active' },
      })

      if (existing) {
        await prisma.subscription.update({
          where: { id: existing.id },
          data: { plan, status: 'active', stripeSubscriptionId: payment.id, currentPeriodEnd: periodEnd },
        })
      } else {
        await prisma.subscription.create({
          data: { userId, plan, status: 'active', stripeSubscriptionId: payment.id, currentPeriodEnd: periodEnd },
        })
      }
    }
  }

  return NextResponse.json({ ok: true })
}
