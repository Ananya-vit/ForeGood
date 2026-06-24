'use client'

import { useActionState } from 'react'
import { addScore } from '@/app/actions/scores'

export function ScoreForm() {
  const [state, action, pending] = useActionState(addScore, { success: false })

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="score" className="block text-sm font-medium">
          Score
        </label>
        <input
          id="score"
          name="score"
          type="number"
          min="1"
          max="999"
          required
          className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm"
          placeholder="e.g. 72"
        />
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium">
          Date
        </label>
        <input
          id="date"
          name="date"
          type="date"
          required
          defaultValue={new Date().toISOString().split('T')[0]}
          className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm"
        />
      </div>

      {state?.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}

      {state?.success && (
        <p className="text-sm text-green-600">Score added!</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-black px-6 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? 'Adding...' : 'Add score'}
      </button>
    </form>
  )
}
