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
    const result = await createRazorpayOrder(plan)

    if ('error' in result) {
      if (result.error === 'unauthorized') {
        router.push('/login?redirect=/pricing')
      } else {
        alert('Failed to create order. Please try again.')
      }
      setLoading(null)
      return
    }

    if (!window.Razorpay) {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      await new Promise((resolve, reject) => {
        script.onload = resolve
        script.onerror = reject
        document.head.appendChild(script)
      })
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: result.amount,
      currency: result.currency,
      name: 'Digital Heroes',
      description: plan === 'yearly' ? 'Yearly subscription' : 'Monthly subscription',
      order_id: result.id,
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
  }

  return (
    <div className="pb-12">
      <div className="mx-auto max-w-3xl px-6 pt-4">
        <div className="text-center opacity-0 animate-fade-in-fast">
          <h1 className="text-4xl font-bold tracking-tight">Choose your plan</h1>
          <p className="mt-3 text-gray-500">
            Join a community where every subscription creates impact — for you and for the causes
            you care about.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg opacity-0 animate-slide-up">
            <h2 className="text-xl font-semibold">Monthly</h2>
            <p className="mt-2 text-4xl font-bold">₹599</p>
            <p className="mt-1 text-sm text-gray-500">per month</p>
            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span> Track your scores
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span> Enter monthly draws
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span> Support a charity of your choice
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span> Cancel anytime
              </li>
            </ul>
            <button
              onClick={() => handleSubscribe('monthly')}
              disabled={loading === 'monthly'}
              className="mt-8 w-full rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-gray-800 disabled:opacity-50"
            >
              {loading === 'monthly' ? 'Please wait...' : 'Subscribe Monthly'}
            </button>
          </div>

          <div className="rounded-2xl border border-black p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg opacity-0 animate-slide-up-delayed">
            <div className="mb-2 inline-block rounded-full bg-black px-3 py-1 text-xs font-medium text-white">
              Best value
            </div>
            <h2 className="text-xl font-semibold">Yearly</h2>
            <p className="mt-2 text-4xl font-bold">₹5,999</p>
            <p className="mt-1 text-sm text-gray-500">₹500/month — save 16%</p>
            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span> Everything in Monthly
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span> 2 months free
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span> Priority support
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span> Maximised charity impact
              </li>
            </ul>
            <button
              onClick={() => handleSubscribe('yearly')}
              disabled={loading === 'yearly'}
              className="mt-8 w-full rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-gray-800 disabled:opacity-50"
            >
              {loading === 'yearly' ? 'Please wait...' : 'Subscribe Yearly'}
            </button>
          </div>
        </div>

        <div className="mt-16 rounded-xl border bg-gray-50/50 p-8 text-center opacity-0 animate-slide-up-slow">
          <h3 className="text-lg font-semibold">Not sure yet?</h3>
          <p className="mt-2 text-sm text-gray-500">
            Every subscription automatically allocates a portion to the charity of your choice.
            You play. You win. You give back.
          </p>
        </div>
      </div>
    </div>
  )
}
