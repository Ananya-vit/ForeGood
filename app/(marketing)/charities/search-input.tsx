'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

export function SearchInput({ q, filter }: { q: string; filter: string }) {
  const router = useRouter()

  const update = useCallback(
    (qVal: string, filterVal: string) => {
      const params = new URLSearchParams()
      if (qVal) params.set('q', qVal)
      if (filterVal && filterVal !== 'all') params.set('filter', filterVal)
      const qs = params.toString()
      router.push(qs ? `/charities?${qs}` : '/charities')
    },
    [router],
  )

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      <input
        type="text"
        placeholder="Search charities..."
        defaultValue={q}
        onChange={(e) => update(e.target.value, filter)}
        className="flex-1 rounded-lg border px-4 py-2 text-sm"
      />
      <select
        value={filter}
        onChange={(e) => update(q, e.target.value)}
        className="rounded-lg border px-3 py-2 text-sm"
      >
        <option value="all">All</option>
        <option value="featured">Featured</option>
      </select>
    </div>
  )
}
