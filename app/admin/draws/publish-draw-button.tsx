'use client'

import { useTransition } from 'react'
import { publishDrawAction } from '@/app/actions/draws'

export function PublishDrawButton({ drawId }: { drawId: string }) {
  const [pending, startTransition] = useTransition()

  return (
    <button
      onClick={() => startTransition(() => { publishDrawAction(drawId) })}
      disabled={pending}
      className="rounded-full bg-blue-600 px-4 py-1.5 text-xs font-medium text-white disabled:opacity-50"
    >
      {pending ? 'Publishing...' : 'Publish'}
    </button>
  )
}
