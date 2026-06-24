import { prisma } from "@/app/lib/prisma"

export default async function AdminReportsPage() {
  const [totalUsers, totalScores, subsByPlan] = await Promise.all([
    prisma.user.count(),
    prisma.score.count(),
    prisma.subscription.groupBy({
      by: ["plan"],
      _count: true,
      where: { status: "active" },
    }),
  ])

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
          </div>
        </div>

        <div className="rounded-xl border p-5">
          <h2 className="font-semibold">Subscriptions by plan</h2>
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
    </div>
  )
}
