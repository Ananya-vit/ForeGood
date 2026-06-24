import { getUser } from "@/app/lib/dal"
import { prisma } from "@/app/lib/prisma"
import Link from "next/link"

export default async function DashboardPage() {
  const user = await getUser()
  const userId = user!.id

  const subscription = await prisma.subscription.findFirst({
    where: { userId, status: "active" },
    include: { charity: { select: { name: true } } },
  })

  const scores = await prisma.score.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: 5,
  })

  const recentDraw = await prisma.drawResult.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { draw: { select: { month: true, year: true } } },
  })

  const winnings = await prisma.winner.findMany({
    where: { userId },
    include: { drawResult: { include: { draw: { select: { month: true, year: true } } } } },
  })

  const totalWon = winnings.reduce((sum, w) => sum + Number(w.drawResult.prizeAmount), 0)

  return (
    <div>
      <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
      <p className="mt-1 text-gray-500">Your dashboard</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border p-5">
          <h2 className="font-semibold">Subscription</h2>
          {subscription ? (
            <div className="mt-1 text-sm">
              <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                Active
              </span>
              <p className="mt-1 text-gray-500 capitalize">{subscription.plan} plan</p>
              <p className="text-gray-400 text-xs">
                Renews {new Date(subscription.currentPeriodEnd!).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <div className="mt-1 text-sm">
              <span className="inline-block rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
                No active plan
              </span>
              <p className="mt-1 text-gray-500">
                <Link href="/pricing" className="underline">Subscribe</Link> to unlock features
              </p>
            </div>
          )}
        </div>

        <Link href="/dashboard/scores" className="rounded-xl border p-5 transition hover:border-black">
          <h2 className="font-semibold">Scores</h2>
          {scores.length > 0 ? (
            <div className="mt-1 text-sm text-gray-500">
              <p>Last 5: {scores.map((s) => s.score).join(", ")}</p>
            </div>
          ) : (
            <p className="mt-1 text-sm text-gray-500">No scores yet</p>
          )}
        </Link>

        <div className="rounded-xl border p-5">
          <h2 className="font-semibold">Charity</h2>
          {subscription?.charity ? (
            <p className="mt-1 text-sm text-gray-500">
              Supporting {subscription.charity.name} ({subscription.charityPct}%)
            </p>
          ) : (
            <p className="mt-1 text-sm text-gray-500">
              <Link href="/dashboard/settings" className="underline">Choose a charity</Link>
            </p>
          )}
        </div>

        <div className="rounded-xl border p-5">
          <h2 className="font-semibold">Draws</h2>
          {recentDraw ? (
            <div className="mt-1 text-sm text-gray-500">
              <p>
                {recentDraw.matchType}-match in {recentDraw.draw.month}/{recentDraw.draw.year}
              </p>
            </div>
          ) : (
            <p className="mt-1 text-sm text-gray-500">No participation yet</p>
          )}
        </div>

        <div className="rounded-xl border p-5">
          <h2 className="font-semibold">Winnings</h2>
          {winnings.length > 0 ? (
            <div className="mt-1 text-sm text-gray-500">
              <p className="text-lg font-semibold text-green-700">₹{totalWon.toLocaleString()}</p>
              {winnings.map((w) => (
                <p key={w.id} className="text-xs">
                  {w.drawResult.draw.month}/{w.drawResult.draw.year} — {w.adminStatus} · {w.paymentStatus}
                </p>
              ))}
            </div>
          ) : (
            <p className="mt-1 text-sm text-gray-500">Total won: ₹0</p>
          )}
        </div>
      </div>
    </div>
  )
}
