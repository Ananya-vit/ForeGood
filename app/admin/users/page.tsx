import { prisma } from "@/app/lib/prisma"
import { UserRow } from "./user-row"

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      subscriptions: { include: { charity: { select: { name: true } } } },
      scores: { orderBy: { date: "desc" }, take: 20 },
    },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold">Users</h1>
      <p className="mt-1 text-gray-500">{users.length} total users</p>

      <div className="mt-8 space-y-3">
        {users.map((u) => (
          <UserRow
            key={u.id}
            user={{ id: u.id, name: u.name, email: u.email, role: u.role }}
            scores={u.scores.map(s => ({ id: s.id, score: s.score, date: s.date.toISOString().split("T")[0] }))}
            subscriptions={u.subscriptions.map(s => ({
              id: s.id,
              plan: s.plan,
              status: s.status,
              currentPeriodEnd: s.currentPeriodEnd?.toISOString() ?? null,
              charityName: s.charity?.name ?? null,
              charityPct: s.charityPct,
            }))}
          />
        ))}
      </div>
    </div>
  )
}
