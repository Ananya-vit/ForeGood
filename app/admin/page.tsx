import { prisma } from "@/app/lib/prisma"

export default async function AdminOverviewPage() {
  const [totalUsers, activeSubs, totalDraws, winners] = await Promise.all([
    prisma.user.count(),
    prisma.subscription.count({ where: { status: "active" } }),
    prisma.draw.count({ where: { status: "completed" } }),
    prisma.winner.findMany({ select: { id: true, drawResult: { select: { prizeAmount: true } } } }),
  ])

  const totalWon = winners.reduce((sum, w) => sum + Number(w.drawResult.prizeAmount), 0)
  const revenue = activeSubs * 599

  return (
    <div>
      <h1 className="text-2xl font-bold">Admin Overview</h1>
      <p className="mt-1 text-gray-500">Platform at a glance</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border p-5">
          <h2 className="font-semibold">Total Users</h2>
          <p className="mt-1 text-2xl font-bold">{totalUsers}</p>
          <p className="text-sm text-gray-500">{activeSubs} active subscriptions</p>
        </div>
        <div className="rounded-xl border p-5">
          <h2 className="font-semibold">Monthly Revenue (est.)</h2>
          <p className="mt-1 text-2xl font-bold">₹{revenue.toLocaleString()}</p>
          <p className="text-sm text-gray-500">{activeSubs} subscribers</p>
        </div>
        <div className="rounded-xl border p-5">
          <h2 className="font-semibold">Draws Completed</h2>
          <p className="mt-1 text-2xl font-bold">{totalDraws}</p>
        </div>
        <div className="rounded-xl border p-5">
          <h2 className="font-semibold">Total Won</h2>
          <p className="mt-1 text-2xl font-bold">₹{totalWon.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border p-5">
          <h2 className="font-semibold">Charity Contributions (est.)</h2>
          <p className="mt-1 text-2xl font-bold">₹{Math.round(revenue * 0.1)}</p>
        </div>
      </div>
    </div>
  )
}
