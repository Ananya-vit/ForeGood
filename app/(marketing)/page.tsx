export const dynamic = 'force-dynamic'

import Link from "next/link"
import { prisma } from "@/app/lib/prisma"
import { Container, Section, GradientText } from "@/app/ui/common"
import { Button } from "@/app/ui/button"
import { StatCard } from "@/app/ui/stat-card"

export default async function HomePage() {
  const [charityCount, activeSubs, totalWinners, charitySubs, featuredCharities] = await Promise.all([
    prisma.charity.count(),
    prisma.subscription.count({ where: { status: "active" } }),
    prisma.winner.count({ where: { adminStatus: "approved" } }),
    prisma.subscription.findMany({
      where: { status: "active", charityId: { not: null } },
      select: { charityPct: true, plan: true },
    }),
    prisma.charity.findMany({ where: { featured: true }, take: 3 }),
  ])
  const planPrices: Record<string, number> = { monthly: 599, yearly: 5999 }
  const charityTotal = charitySubs.reduce((sum, s) => {
    const price = planPrices[s.plan] ?? 599
    return sum + Math.round(price * (s.charityPct / 100))
  }, 0)

  return (
    <>
      <Section className="pt-8 pb-16 md:pt-16 md:pb-24">
        <div className="mx-auto max-w-3xl text-center opacity-0 animate-fade-in">
          <h1 className="text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
            Your game. <GradientText>Their future.</GradientText>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-gray-500">
            You already play. Now every round funds real change — supporting the charities you care
            about while giving you a shot at winning monthly prizes.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Button href="/signup">Start making an impact</Button>
            <Button href="/charities" variant="outline">
              Explore charities
            </Button>
          </div>
        </div>
      </Section>

      <div className="border-y bg-gray-50/50">
        <Container className="py-16">
          <div className="grid gap-8 sm:grid-cols-4 opacity-0 animate-slide-up">
            <StatCard label="Active members" value={activeSubs.toString()} />
            <StatCard label="Charities supported" value={charityCount.toString()} />
            <StatCard label="Raised for charity" value={`₹${charityTotal.toLocaleString()}`} suffix="+" />
            <StatCard label="Winners paid" value={totalWinners.toString()} />
          </div>
        </Container>
      </div>

      <Section className="opacity-0 animate-slide-up-delayed">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
          <p className="mt-3 text-gray-500">Three simple steps to turn your rounds into impact</p>
        </div>
        <div className="mt-16 grid gap-8 sm:grid-cols-3">
          {[
            { step: "01", title: "Subscribe", desc: "Pick monthly or yearly. Your subscription powers the prize pool and sends a portion to the charity you choose." },
            { step: "02", title: "Play & track", desc: "Play your rounds and log your scores. Every score enters you into the monthly draw automatically." },
            { step: "03", title: "Win & give back", desc: "Match the drawn numbers to win. Meanwhile, your chosen charity receives a share of every subscription." },
          ].map((item) => (
            <div key={item.step} className="group text-center transition-all duration-300 hover:-translate-y-1">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-black text-sm font-medium text-white transition-transform duration-300 group-hover:scale-110">
                {item.step}
              </div>
              <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="bg-gray-50/50">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">Every subscription gives back</h2>
          <p className="mt-3 text-gray-500">
            A portion of every plan goes directly to the charity you select — no extra cost, no
            hassle.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          <div className="rounded-xl border bg-white p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
            <p className="text-3xl font-bold">₹{charityTotal.toLocaleString()}+</p>
            <p className="mt-1 text-sm text-gray-500">Estimated total contributed to charities</p>
          </div>
          <div className="rounded-xl border bg-white p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
            <p className="text-3xl font-bold">{activeSubs}</p>
            <p className="mt-1 text-sm text-gray-500">Active subscribers making a difference</p>
          </div>
          <div className="rounded-xl border bg-white p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
            <p className="text-3xl font-bold">{charityCount}</p>
            <p className="mt-1 text-sm text-gray-500">Charities you can support</p>
          </div>
        </div>
      </Section>

      {featuredCharities.length > 0 && (
        <Section>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">Featured charities</h2>
            <p className="mt-3 text-gray-500">The causes our community supports</p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {featuredCharities.map((c) => (
              <Link
                key={c.id}
                href={`/charities/${c.id}`}
                className="group rounded-xl border bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <h3 className="font-semibold transition-colors duration-300 group-hover:text-gray-600">{c.name}</h3>
                {c.description && (
                  <p className="mt-2 text-sm leading-relaxed text-gray-500 line-clamp-3">{c.description}</p>
                )}
              </Link>
            ))}
          </div>
        </Section>
      )}

      <Section className="text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight">
            Ready to make every round count?
          </h2>
          <p className="mt-3 text-gray-500">
            Join a community turning passion into purpose — one swing at a time.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Button href="/signup">Subscribe now</Button>
            <Button href="/pricing" variant="outline">View pricing</Button>
          </div>
        </div>
      </Section>
    </>
  )
}