'use client'

import { useActionState } from 'react'
import { selectCharity } from '@/app/actions/charities'

export function CharitySelector({
  charities,
  currentCharityId,
  currentPct,
}: {
  charities: { id: string; name: string }[]
  currentCharityId: string | null
  currentPct: number
}) {
  const [state, action, pending] = useActionState(selectCharity, { success: false })

  return (
    <form action={action} className="mt-4 space-y-4">
      <div>
        <label htmlFor="charityId" className="block text-sm font-medium">
          Charity
        </label>
        <select
          id="charityId"
          name="charityId"
          defaultValue={currentCharityId || ''}
          className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm"
        >
          <option value="">None</option>
          {charities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="charityPct" className="block text-sm font-medium">
          Contribution % (min 10%)
        </label>
        <input
          id="charityPct"
          name="charityPct"
          type="number"
          min={10}
          max={100}
          defaultValue={currentPct}
          className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm"
        />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-600">Saved!</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-black px-6 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? 'Saving...' : 'Update'}
      </button>
    </form>
  )
}
