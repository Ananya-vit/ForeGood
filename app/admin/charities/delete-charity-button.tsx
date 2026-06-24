'use client'

import { useTransition } from 'react'
import { deleteCharity } from '@/app/actions/charities'

export function DeleteCharityButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition()

  return (
    <button
      onClick={() => startTransition(() => { deleteCharity(id) })}
      disabled={pending}
      className="text-sm text-red-500 hover:text-red-700 disabled:opacity-50"
    >
      {pending ? 'Deleting...' : 'Delete'}
    </button>
  )
}
