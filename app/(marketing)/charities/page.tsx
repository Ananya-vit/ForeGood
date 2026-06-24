import Link from "next/link"
import { prisma } from "@/app/lib/prisma"

export default async function CharityDirectoryPage() {
  const charities = await prisma.charity.findMany({ orderBy: { name: "asc" } })

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold">Charities</h1>
      <p className="mt-2 text-gray-500">Support a cause with your subscription contribution</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {charities.length === 0 ? (
          <p className="text-sm text-gray-400">No charities listed yet.</p>
        ) : (
          charities.map((c) => (
            <Link
              key={c.id}
              href={`/charities/${c.id}`}
              className="rounded-xl border p-6 transition hover:border-black"
            >
              <h2 className="text-lg font-semibold">{c.name}</h2>
              {c.description && (
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">{c.description}</p>
              )}
              {c.featured && (
                <span className="mt-2 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                  Featured
                </span>
              )}
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
