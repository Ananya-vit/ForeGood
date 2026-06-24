'use client'

import { useTransition } from 'react'
import { executeDraw } from '@/app/actions/draws'

export function ExecuteDrawButton({ drawId }: { drawId: string }) {
  const [pending, startTransition] = useTransition()

  return (
    <button
      onClick={() => startTransition(() => { executeDraw(drawId) })}
      disabled={pending}
      className="rounded-full bg-green-600 px-4 py-1.5 text-xs font-medium text-white disabled:opacity-50"
    >
      {pending ? 'Running...' : 'Run draw'}
    </button>
  )
}
