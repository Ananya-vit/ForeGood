import { prisma } from "@/app/lib/prisma";
import { CreateDrawForm } from "./create-draw-form";
import { ExecuteDrawButton } from "./execute-draw-button";
import { PublishDrawButton } from "./publish-draw-button";
import { RerunDrawButton } from "./rerun-draw-button";
import { DeleteDrawButton } from "./delete-draw-button";
import Link from "next/link";

export default async function AdminDrawsPage() {
  const draws = await prisma.draw.findMany({
    orderBy: [{ year: "desc" }, { month: "desc" }],
    include: { _count: { select: { drawResults: true } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Draw Management</h1>
      <p className="mt-1 text-gray-500">Create, simulate, and publish monthly draws</p>

      <div className="mt-8 max-w-sm">
        <h2 className="text-lg font-semibold">New draw</h2>
        <CreateDrawForm />
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold">Draws</h2>

        {draws.length === 0 ? (
          <p className="mt-2 text-sm text-gray-400">No draws yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {draws.map((d) => (
              <div key={d.id} className="rounded-lg border px-4 py-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">
                      {d.month}/{d.year}
                    </span>
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        d.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : d.status === "simulated"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {d.status}
                    </span>
                    <span className="text-xs text-gray-500 capitalize">{d.drawType}</span>
                    <span className="text-xs text-gray-400">
                      {d._count.drawResults} entries
                    </span>
                    <span className="text-xs text-gray-400">
                      Pool: ₹{Number(d.prizePool5) + Number(d.prizePool4) + Number(d.prizePool3)} ({d.poolPct}%)
                    </span>
                    {d.winningNumbers.length > 0 && (
                      <span className="text-xs text-gray-500">
                        Numbers: {d.winningNumbers.join(", ")}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {d.status !== "pending" && (
                      <Link href={`/admin/draws/${d.id}/results`} className="rounded-full border px-3 py-1.5 text-xs font-medium hover:bg-gray-50">
                        Numbers
                      </Link>
                    )}
                    {d.status === "pending" && <ExecuteDrawButton drawId={d.id} />}
                    {d.status === "simulated" && <PublishDrawButton drawId={d.id} />}
                    {d.status !== "completed" && (
                      <>
                        {d.status === "simulated" && <RerunDrawButton drawId={d.id} />}
                        <DeleteDrawButton drawId={d.id} />
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
