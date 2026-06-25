import { prisma } from "@/app/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"

function NumbersRow({ numbers, winning }: { numbers: number[]; winning: number[] }) {
  const sorted = [...numbers].sort((a, b) => a - b)
  return (
    <div className="flex gap-1.5">
      {sorted.map((n, i) => {
        const matched = winning.includes(n)
        return (
          <span
            key={i}
            className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
              matched
                ? "bg-green-200 text-green-800 ring-2 ring-green-500"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {n}
          </span>
        )
      })}
    </div>
  )
}

export default async function DrawResultsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const draw = await prisma.draw.findUnique({
    where: { id },
    include: {
      drawResults: {
        orderBy: [{ matchType: "desc" }, { createdAt: "asc" }],
        include: {
          user: { select: { name: true, email: true } },
          winner: { select: { adminStatus: true, paymentStatus: true, proofUrl: true } },
        },
      },
    },
  })
  if (!draw) notFound()

  const winning = draw.winningNumbers.sort((a, b) => a - b)
  const summary = {
    total: draw.drawResults.length,
    m5: draw.drawResults.filter((r) => r.matchType === 5).length,
    m4: draw.drawResults.filter((r) => r.matchType === 4).length,
    m3: draw.drawResults.filter((r) => r.matchType === 3).length,
  }

  return (
    <div>
      <Link href="/admin/draws" className="text-sm text-gray-500 underline">&larr; Back to draws</Link>

      <h1 className="mt-4 text-2xl font-bold">
        Draw {draw.month}/{draw.year}
      </h1>

      <div className="mt-2 flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium">{draw.status}</span>
        <span className="text-xs text-gray-500 capitalize">{draw.drawType}</span>
        <span className="text-xs text-gray-500">{draw.poolPct}% pool</span>
      </div>

      {draw.winningNumbers.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-600">Winning numbers</p>
          <NumbersRow numbers={winning} winning={winning} />
        </div>
      )}

      <div className="mt-6 flex gap-6 text-sm">
        <div><span className="font-semibold">{summary.total}</span> total entries</div>
        <div><span className="font-semibold text-green-700">{summary.m5}</span> 5-match</div>
        <div><span className="font-semibold text-blue-700">{summary.m4}</span> 4-match</div>
        <div><span className="font-semibold text-gray-700">{summary.m3}</span> 3-match</div>
      </div>

      <div className="mt-6 space-y-3">
        {draw.drawResults.length === 0 ? (
          <p className="text-sm text-gray-400">No entries yet. Run the draw first.</p>
        ) : (
          draw.drawResults.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-lg border px-4 py-3">
              <div className="flex items-center gap-4">
                <NumbersRow numbers={r.userNumbers} winning={winning} />
                <div>
                  <p className="text-sm font-medium">{r.user.name}</p>
                  <p className="text-xs text-gray-400">{r.user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-right">
                <div>
                  <p className="text-sm font-semibold">
                    {r.matchType}-match
                  </p>
                  <p className="text-xs text-gray-500">₹{Number(r.prizeAmount).toLocaleString()}</p>
                </div>
                {r.winner && (
                  <div className="flex flex-col items-end gap-1">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      r.winner.adminStatus === "approved" ? "bg-green-100 text-green-700" :
                      r.winner.adminStatus === "rejected" ? "bg-red-100 text-red-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>
                      {r.winner.adminStatus}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      r.winner.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                    }`}>
                      {r.winner.paymentStatus}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
