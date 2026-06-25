import { prisma } from "@/app/lib/prisma"
import { WinnerActions } from "./winner-actions"

export default async function AdminWinnersPage() {
  const winners = await prisma.winner.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      drawResult: {
        include: { draw: { select: { month: true, year: true } } },
      },
    },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold">Winner Verification</h1>
      <p className="mt-1 text-gray-500">Review submissions and manage payouts</p>

      <div className="mt-8 space-y-4">
        {winners.length === 0 ? (
          <p className="text-sm text-gray-400">No winners yet.</p>
        ) : (
          winners.map((w) => (
            <div key={w.id} className="rounded-xl border p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{w.user.name}</p>
                  <p className="text-sm text-gray-500">{w.user.email}</p>
                  <p className="mt-1 text-sm">
                    Draw: {w.drawResult.draw.month}/{w.drawResult.draw.year}
                    {" — "}
                    {w.drawResult.matchType}-match · ₹{Number(w.drawResult.prizeAmount).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className={`rounded-full px-2 py-0.5 font-medium ${
                      w.adminStatus === "approved"
                        ? "bg-green-100 text-green-700"
                        : w.adminStatus === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {w.adminStatus}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 font-medium ${
                      w.paymentStatus === "paid"
                        ? "bg-green-100 text-green-700"
                        : w.paymentStatus === "failed"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {w.paymentStatus}
                  </span>
                </div>
              </div>

              {w.proofUrl && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-blue-600 underline">View proof screenshot</summary>
                  <img src={w.proofUrl} alt="Score proof" className="mt-2 max-h-64 rounded border object-contain" />
                </details>
              )}

              <WinnerActions
                id={w.id}
                adminStatus={w.adminStatus}
                paymentStatus={w.paymentStatus}
              />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
