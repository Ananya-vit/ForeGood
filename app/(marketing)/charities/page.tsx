import Link from "next/link"
import { prisma } from "@/app/lib/prisma"
import { SearchInput } from "./search-input"

export default async function CharityDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filter?: string }>
}) {
  const { q, filter } = await searchParams

  const charities = await prisma.charity.findMany({
    where: {
      ...(filter === "featured" ? { featured: true } : {}),
      ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
    },
    orderBy: { name: "asc" },
  })

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold">Charities</h1>
      <p className="mt-2 text-gray-500">Support a cause with your subscription contribution</p>

      <SearchInput q={q ?? ""} filter={filter ?? "all"} />

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {charities.length === 0 ? (
          <p className="text-sm text-gray-400 col-span-full">No charities match your search.</p>
        ) : (
          charities.map((c) => (
            <Link
              key={c.id}
              href={`/charities/${c.id}`}
              className="group rounded-xl border p-6 transition hover:border-black"
            >
              {c.imageUrl && (
                <img src={c.imageUrl} alt={c.name} className="mb-4 h-40 w-full rounded-lg object-cover" />
              )}
              <h2 className="text-lg font-semibold group-hover:underline">{c.name}</h2>
              {c.description && (
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">{c.description}</p>
              )}
              <div className="mt-2 flex items-center gap-2">
                {c.featured && (
                  <span className="inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                    Featured
                  </span>
                )}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
