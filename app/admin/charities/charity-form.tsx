'use client'

import { useActionState } from 'react'
import { createCharity } from '@/app/actions/charities'

export function CharityForm() {
  const [state, action, pending] = useActionState(createCharity, { success: false })

  return (
    <form action={action} className="mt-4 space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium">Name</label>
        <input id="name" name="name" required className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm" />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium">Description</label>
        <textarea id="description" name="description" rows={3} className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm" />
      </div>
      <div>
        <label htmlFor="website" className="block text-sm font-medium">Website</label>
        <input id="website" name="website" type="url" className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm" />
      </div>
      <div className="flex items-center gap-2">
        <input id="featured" name="featured" type="checkbox" value="true" className="rounded border" />
        <label htmlFor="featured" className="text-sm font-medium">Featured</label>
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-600">Charity created!</p>}
      <button type="submit" disabled={pending} className="rounded-full bg-black px-6 py-2 text-sm font-medium text-white disabled:opacity-50">
        {pending ? 'Creating...' : 'Create charity'}
      </button>
    </form>
  )
}
