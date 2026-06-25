'use client'

import { useActionState } from 'react'
import { createEvent } from '@/app/actions/charities'

export function EventForm({ charityId }: { charityId: string }) {
  const [state, action, pending] = useActionState(createEvent, { success: false })

  return (
    <form action={action} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="charityId" value={charityId} />
      <div>
        <label className="block text-xs text-gray-500">Title</label>
        <input name="title" required className="mt-0.5 rounded border px-2 py-1 text-sm" />
      </div>
      <div>
        <label className="block text-xs text-gray-500">Date</label>
        <input name="date" type="date" required className="mt-0.5 rounded border px-2 py-1 text-sm" />
      </div>
      <div>
        <label className="block text-xs text-gray-500">Location</label>
        <input name="location" className="mt-0.5 rounded border px-2 py-1 text-sm" />
      </div>
      <div>
        <label className="block text-xs text-gray-500">Description</label>
        <input name="description" className="mt-0.5 rounded border px-2 py-1 text-sm" />
      </div>
      <button type="submit" disabled={pending} className="rounded bg-black px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50">
        {pending ? '...' : 'Add'}
      </button>
      {state?.error && <p className="text-xs text-red-500">{state.error}</p>}
    </form>
  )
}
