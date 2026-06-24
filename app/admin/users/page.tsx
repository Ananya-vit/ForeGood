import { prisma } from "@/app/lib/prisma"
import { UserActions } from "./user-actions"

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      subscriptions: { where: { status: "active" }, take: 1 },
      _count: { select: { scores: true } },
    },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold">Users</h1>
      <p className="mt-1 text-gray-500">{users.length} total users</p>

      <div className="mt-8 space-y-3">
        {users.map((u) => (
          <div key={u.id} className="flex items-center justify-between rounded-lg border px-4 py-3">
            <div>
              <p className="font-medium">{u.name}</p>
              <p className="text-sm text-gray-500">{u.email}</p>
              <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                <span>{u.role}</span>
                <span>{u._count.scores} scores</span>
                {u.subscriptions[0] && (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 font-medium text-green-700">
                    {u.subscriptions[0].plan}
                  </span>
                )}
              </div>
            </div>
            <UserActions userId={u.id} currentRole={u.role} />
          </div>
        ))}
      </div>
    </div>
  )
}
