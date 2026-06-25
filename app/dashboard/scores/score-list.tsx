'use client'

import { useActionState, useState } from 'react'
import { deleteScore, updateScore } from '@/app/actions/scores'

type ScoreItem = { id: string; score: number; date: string }

export function ScoreList({ scores }: { scores: ScoreItem[] }) {
  const [editing, setEditing] = useState<string | null>(null)
  const [state, action, pending] = useActionState(updateScore, { success: false })

  return (
    <div className="mt-4 space-y-2">
      {scores.map((s) => (
        <div key={s.id} className="rounded-lg border px-4 py-3">
          {editing === s.id ? (
            <form action={action} className="flex items-center gap-2">
              <input type="hidden" name="id" value={s.id} />
              <input
                name="score"
                type="number"
                min="1"
                max="45"
                defaultValue={s.score}
                required
                className="w-20 rounded border px-2 py-1 text-sm"
              />
              <input
                name="date"
                type="date"
                defaultValue={s.date}
                required
                className="rounded border px-2 py-1 text-sm"
              />
              <button
                type="submit"
                disabled={pending}
                className="rounded bg-black px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
              >
                {pending ? '...' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
              {state?.error && <p className="text-xs text-red-500">{state.error}</p>}
            </form>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <span className="text-lg font-semibold">{s.score}</span>
                <span className="ml-3 text-sm text-gray-500">{s.date}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(s.id)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteScore(s.id)}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
