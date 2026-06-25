'use client'

import { useTransition } from 'react'
import { deleteEvent } from '@/app/actions/charities'

export function DeleteEventButton({ id }: { id: string }) {
  const [pending, start] = useTransition()

  return (
    <button
      onClick={() => start(() => deleteEvent(id))}
      disabled={pending}
      className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
    >
      {pending ? '...' : 'Delete'}
    </button>
  )
}
