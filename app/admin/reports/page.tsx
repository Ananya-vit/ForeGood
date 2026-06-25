import { prisma } from "@/app/lib/prisma"
import { PLANS } from "@/app/lib/razorpay"

export default async function AdminReportsPage() {
  const [totalUsers, totalScores, subsByPlan, draws, activeSubs] = await Promise.all([
    prisma.user.count(),
    prisma.score.count(),
    prisma.subscription.groupBy({
      by: ["plan"],
      _count: true,
      where: { status: "active" },
    }),
    prisma.draw.findMany({
      orderBy: [{ year: "desc" }, { month: "desc" }],
      include: {
        _count: { select: { drawResults: true } },
        drawResults: {
          where: { winner: { isNot: null } },
          include: { winner: { select: { adminStatus: true } } },
        },
      },
    }),
    prisma.subscription.findMany({
      where: { status: "active", charityId: { not: null } },
      select: { charityPct: true, plan: true },
    }),
  ])

  const planPrices: Record<string, number> = { monthly: 599, yearly: 5999 }
  const charityTotal = activeSubs.reduce((sum, s) => {
    const price = planPrices[s.plan] ?? 599
    return sum + Math.round(price * (s.charityPct / 100))
  }, 0)

  return (
    <div>
      <h1 className="text-2xl font-bold">Reports</h1>
      <p className="mt-1 text-gray-500">Platform analytics</p>

      <div className="mt-8 grid gap-8 sm:grid-cols-2">
        <div className="rounded-xl border p-5">
          <h2 className="font-semibold">Overview</h2>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Total users</span>
              <span className="font-medium">{totalUsers}</span>
            </div>
            <div className="flex justify-between">
              <span>Total scores</span>
              <span className="font-medium">{totalScores}</span>
            </div>
            <div className="flex justify-between">
              <span>Charity contributions (est.)</span>
              <span className="font-medium">₹{charityTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border p-5">
          <h2 className="font-semibold">Active subscriptions by plan</h2>
          {subsByPlan.length > 0 ? (
            <div className="mt-3 space-y-2 text-sm">
              {subsByPlan.map((s) => (
                <div key={s.plan} className="flex justify-between">
                  <span className="capitalize">{s.plan}</span>
                  <span className="font-medium">{s._count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-gray-400">No active subscriptions</p>
          )}
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold">Draw statistics</h2>
        {draws.length === 0 ? (
          <p className="mt-2 text-sm text-gray-400">No draws yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-2 pr-4">Draw</th>
                  <th className="pb-2 pr-4">Status</th>
                  <th className="pb-2 pr-4">Entries</th>
                  <th className="pb-2 pr-4">Pool (5/4/3)</th>
                  <th className="pb-2 pr-4">Winners</th>
                </tr>
              </thead>
              <tbody>
                {draws.map((d) => {
                  const approved = d.drawResults.filter(r => r.winner?.adminStatus === "approved").length
                  const pending = d.drawResults.filter(r => r.winner?.adminStatus === "pending").length
                  return (
                    <tr key={d.id} className="border-b">
                      <td className="py-2 pr-4 font-medium">{d.month}/{d.year}</td>
                      <td className="py-2 pr-4 capitalize">{d.status}</td>
                      <td className="py-2 pr-4">{d._count.drawResults}</td>
                      <td className="py-2 pr-4 text-xs">
                        ₹{Number(d.prizePool5)} / ₹{Number(d.prizePool4)} / ₹{Number(d.prizePool3)}
                      </td>
                      <td className="py-2 pr-4">
                        {approved} approved, {pending} pending
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
