'use client'

import { useTransition } from 'react'
import { rerunDraw } from '@/app/actions/draws'

export function RerunDrawButton({ drawId }: { drawId: string }) {
  const [pending, start] = useTransition()

  return (
    <button
      onClick={() => start(() => { rerunDraw(drawId) })}
      disabled={pending}
      className="rounded-full bg-orange-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
    >
      {pending ? 'Rerunning...' : 'Rerun'}
    </button>
  )
}
