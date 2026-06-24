'use client'

import { useActionState } from 'react'
import { createDraw } from '@/app/actions/draws'

export function CreateDrawForm() {
  const [state, action, pending] = useActionState(createDraw, { success: false })
  const now = new Date()
  const nextMonth = now.getMonth() + 1
  const year = nextMonth > 12 ? now.getFullYear() + 1 : now.getFullYear()
  const month = nextMonth > 12 ? 1 : nextMonth

  return (
    <form action={action} className="mt-4 space-y-4">
      <div className="flex gap-3">
        <div className="flex-1">
          <label htmlFor="month" className="block text-sm font-medium">
            Month
          </label>
          <input
            id="month"
            name="month"
            type="number"
            min={1}
            max={12}
            required
            defaultValue={month}
            className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="year" className="block text-sm font-medium">
            Year
          </label>
          <input
            id="year"
            name="year"
            type="number"
            required
            defaultValue={year}
            className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="drawType" className="block text-sm font-medium">
          Draw type
        </label>
        <select
          id="drawType"
          name="drawType"
          defaultValue="random"
          className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm"
        >
          <option value="random">Random</option>
          <option value="algorithmic">Algorithmic</option>
        </select>
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-600">Draw created!</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-black px-6 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? 'Creating...' : 'Create draw'}
      </button>
    </form>
  )
}
