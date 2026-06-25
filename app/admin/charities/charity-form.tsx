'use client'

import { useActionState } from 'react'
import { createCharity, updateCharity } from '@/app/actions/charities'

export function CharityForm({ charity }: { charity?: { id: string; name: string; description: string | null; imageUrl: string | null; website: string | null; featured: boolean } }) {
  const action = charity ? updateCharity : createCharity
  const [state, formAction, pending] = useActionState(action, { success: false })

  return (
    <form action={formAction} className="mt-4 space-y-4">
      {charity && <input type="hidden" name="id" value={charity.id} />}
      <div>
        <label htmlFor="name" className="block text-sm font-medium">Name</label>
        <input id="name" name="name" required defaultValue={charity?.name ?? ''} className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm" />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium">Description</label>
        <textarea id="description" name="description" rows={3} defaultValue={charity?.description ?? ''} className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm" />
      </div>
      <div>
        <label htmlFor="imageUrl" className="block text-sm font-medium">Image URL</label>
        <input id="imageUrl" name="imageUrl" type="url" defaultValue={charity?.imageUrl ?? ''} className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm" />
      </div>
      <div>
        <label htmlFor="website" className="block text-sm font-medium">Website</label>
        <input id="website" name="website" type="url" defaultValue={charity?.website ?? ''} className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm" />
      </div>
      <div className="flex items-center gap-2">
        <input id="featured" name="featured" type="checkbox" value="true" defaultChecked={charity?.featured ?? false} className="rounded border" />
        <label htmlFor="featured" className="text-sm font-medium">Featured</label>
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-600">{charity ? 'Updated!' : 'Created!'}</p>}
      <button type="submit" disabled={pending} className="w-full rounded-full bg-black px-6 py-2 text-sm font-medium text-white disabled:opacity-50 sm:w-auto">
        {pending ? 'Saving...' : charity ? 'Update charity' : 'Create charity'}
      </button>
    </form>
  )
}
