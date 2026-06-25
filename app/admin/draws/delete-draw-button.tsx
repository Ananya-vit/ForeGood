'use client'

import { useTransition } from 'react'
import { deleteDraw } from '@/app/actions/draws'

export function DeleteDrawButton({ drawId }: { drawId: string }) {
  const [pending, start] = useTransition()

  return (
    <button
      onClick={() => {
        if (!confirm('Delete this draw? This cannot be undone.')) return
        start(() => { deleteDraw(drawId) })
      }}
      disabled={pending}
      className="rounded-full border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
    >
      {pending ? '...' : 'Delete'}
    </button>
  )
}
