import Link from "next/link"
import { prisma } from "@/app/lib/prisma"
import { Container, Section, GradientText } from "@/app/ui/common"
import { Button } from "@/app/ui/button"
import { StatCard } from "@/app/ui/stat-card"

export default async function HomePage() {
  const [charityCount, activeSubs, totalWinners, featuredCharities] = await Promise.all([
    prisma.charity.count(),
    prisma.subscription.count({ where: { status: "active" } }),
    prisma.winner.count({ where: { adminStatus: "approved" } }),
    prisma.charity.findMany({ where: { featured: true }, take: 3 }),
  ])

  return (
    <div className="flex min-h-screen flex-col">
      <header className="fixed top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <Container className="flex h-16 items-center justify-between">
          <Link href="/" className="text-lg font-bold tracking-tight">
            Digital Heroes
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/pricing" className="font-medium text-gray-600 hover:text-black transition-colors">
              Pricing
            </Link>
            <Link href="/charities" className="font-medium text-gray-600 hover:text-black transition-colors">
              Charities
            </Link>
            <Link href="/login" className="font-medium text-gray-600 hover:text-black transition-colors">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
            >
              Get started
            </Link>
          </nav>
        </Container>
      </header>

      <main>
        <Section className="pt-32 pb-24">
          <div className="mx-auto max-w-3xl text-center opacity-0 animate-fade-in">
            <h1 className="text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
              Every swing <GradientText>makes a difference</GradientText>
            </h1>
            <p className="mt-6 text-lg text-gray-500 leading-relaxed">
              You love golf. Now let it mean something. Track your scores, enter monthly draws,
              and support the charity you choose — all through the game you already play.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Button href="/signup">Start making an impact</Button>
              <Button href="/charities" variant="outline">Explore charities</Button>
            </div>
          </div>
        </Section>

        <div className="border-y bg-gray-50/50">
          <Container className="py-16">
            <div className="grid gap-8 sm:grid-cols-3 opacity-0 animate-slide-up">
              <StatCard label="Active subscribers" value={activeSubs.toString()} />
              <StatCard label="Charities supported" value={charityCount.toString()} />
              <StatCard label="Winners paid out" value={totalWinners.toString()} />
            </div>
          </Container>
        </div>

        <Section className="opacity-0 animate-slide-up-delayed">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
            <p className="mt-3 text-gray-500">Three simple steps to start making an impact</p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {[
              { step: "01", title: "Subscribe", desc: "Choose monthly or yearly. Your subscription funds the prize pool and charity contributions." },
              { step: "02", title: "Play & score", desc: "Play golf and enter your scores. Each round gives you an entry into the monthly draw." },
              { step: "03", title: "Win & give", desc: "Match winning numbers to win prizes. A portion of every subscription goes to the charity you pick." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-black text-sm font-medium text-white">
                  {item.step}
                </div>
                <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        {featuredCharities.length > 0 && (
          <Section className="bg-gray-50/50">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight">Featured charities</h2>
              <p className="mt-3 text-gray-500">The causes our community supports</p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {featuredCharities.map((c) => (
                <Link
                  key={c.id}
                  href={`/charities/${c.id}`}
                  className="rounded-xl border bg-white p-6 transition hover:shadow-md"
                >
                  <h3 className="font-semibold">{c.name}</h3>
                  {c.description && (
                    <p className="mt-2 text-sm text-gray-500 line-clamp-3">{c.description}</p>
                  )}
                </Link>
              ))}
            </div>
          </Section>
        )}

        <Section className="text-center">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight">
              Ready to make every swing count?
            </h2>
            <p className="mt-3 text-gray-500">
              Join a community of golfers who turned their passion into purpose.
            </p>
            <div className="mt-8">
              <Button href="/signup">Subscribe now</Button>
            </div>
          </div>
        </Section>
      </main>

      <footer className="border-t py-8">
        <Container className="flex items-center justify-between text-sm text-gray-400">
          <span>&copy; {new Date().getFullYear()} Digital Heroes</span>
          <div className="flex gap-6">
            <Link href="/pricing" className="hover:text-gray-600 transition-colors">Pricing</Link>
            <Link href="/charities" className="hover:text-gray-600 transition-colors">Charities</Link>
          </div>
        </Container>
      </footer>
    </div>
  )
}
