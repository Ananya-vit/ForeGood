import { prisma } from './prisma'

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@fore-good.vercel.app'

type EmailPayload = {
  to: string
  subject: string
  html: string
}

async function send(payload: EmailPayload) {
  if (!RESEND_API_KEY) return

  try {
    const { Resend } = await import('resend')
    const resend = new Resend(RESEND_API_KEY)
    await resend.emails.send({
      from: FROM_EMAIL,
      ...payload,
    })
  } catch {
    // silently fail — email is optional
  }
}

export async function notifyDrawWinner(userId: string, drawLabel: string, matchType: number, prizeAmount: number) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true } })
  if (!user) return

  await send({
    to: user.email,
    subject: `You won in the ${drawLabel} draw!`,
    html: `<p>Hi ${user.name},</p>
<p>Congratulations! You matched <strong>${matchType}</strong> numbers in the <strong>${drawLabel}</strong> draw.</p>
<p>Prize: <strong>₹${prizeAmount.toLocaleString()}</strong></p>
<p>Check your dashboard for details.</p>`,
  })
}

export async function notifyPaymentApproved(userId: string, prizeAmount: number) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true } })
  if (!user) return

  await send({
    to: user.email,
    subject: 'Your prize payment has been processed',
    html: `<p>Hi ${user.name},</p>
<p>Your prize of <strong>₹${prizeAmount.toLocaleString()}</strong> has been marked as paid.</p>
<p>Thank you for being part of our community!</p>`,
  })
}
