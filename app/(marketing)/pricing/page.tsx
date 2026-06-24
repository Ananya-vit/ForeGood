'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createRazorpayOrder } from '@/app/actions/subscriptions'
import type { PlanType } from '@/app/lib/razorpay'

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void }
  }
}

export default function PricingPage() {
  const [loading, setLoading] = useState<PlanType | null>(null)
  const router = useRouter()

  async function handleSubscribe(plan: PlanType) {
    setLoading(plan)
    try {
      const order = await createRazorpayOrder(plan)

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Digital Heroes',
        description: plan === 'yearly' ? 'Yearly subscription' : 'Monthly subscription',
        order_id: order.id,
        handler: function (response: {
          razorpay_order_id: string
          razorpay_payment_id: string
          razorpay_signature: string
        }) {
          const form = document.createElement('form')
          form.method = 'POST'
          form.action = '/api/razorpay/callback'

          const inputs = { razorpay_order_id: response.razorpay_order_id, razorpay_payment_id: response.razorpay_payment_id, razorpay_signature: response.razorpay_signature, plan }

          for (const [name, value] of Object.entries(inputs)) {
            const input = document.createElement('input')
            input.type = 'hidden'
            input.name = name
            input.value = value
            form.appendChild(input)
          }

          document.body.appendChild(form)
          form.submit()
        },
        modal: {
          ondismiss: () => setLoading(null),
        },
        prefill: { contact: '', email: '' },
        theme: { color: '#000000' },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch {
      alert('Failed to create order. Please try again.')
      setLoading(null)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-3xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Choose your plan</h1>
          <p className="mt-2 text-gray-500">
            Subscribe and start making an impact with every swing
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border p-8">
            <h2 className="text-xl font-semibold">Monthly</h2>
            <p className="mt-2 text-4xl font-bold">₹599</p>
            <p className="mt-1 text-sm text-gray-500">per month</p>
            <ul className="mt-6 space-y-2 text-sm">
              <li>✓ Track your golf scores</li>
              <li>✓ Enter monthly draws</li>
              <li>✓ Support a charity</li>
              <li>✓ Cancel anytime</li>
            </ul>
            <button
              onClick={() => handleSubscribe('monthly')}
              disabled={loading === 'monthly'}
              className="mt-8 w-full rounded-full bg-black px-6 py-3 text-sm font-medium text-white disabled:opacity-50"
            >
              {loading === 'monthly' ? 'Please wait...' : 'Subscribe Monthly'}
            </button>
          </div>

          <div className="rounded-2xl border border-black p-8">
            <div className="mb-2 inline-block rounded-full bg-black px-3 py-1 text-xs font-medium text-white">
              Best value
            </div>
            <h2 className="text-xl font-semibold">Yearly</h2>
            <p className="mt-2 text-4xl font-bold">₹5,999</p>
            <p className="mt-1 text-sm text-gray-500">₹500/month — save 16%</p>
            <ul className="mt-6 space-y-2 text-sm">
              <li>✓ Everything in Monthly</li>
              <li>✓ 2 months free</li>
              <li>✓ Priority support</li>
            </ul>
            <button
              onClick={() => handleSubscribe('yearly')}
              disabled={loading === 'yearly'}
              className="mt-8 w-full rounded-full bg-black px-6 py-3 text-sm font-medium text-white disabled:opacity-50"
            >
              {loading === 'yearly' ? 'Please wait...' : 'Subscribe Yearly'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
