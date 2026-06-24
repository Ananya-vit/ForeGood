'use client'

import { deleteScore } from '@/app/actions/scores'

type ScoreItem = { id: string; score: number; date: string }

export function ScoreList({ scores }: { scores: ScoreItem[] }) {
  return (
    <div className="mt-4 space-y-2">
      {scores.map((s) => (
        <div key={s.id} className="flex items-center justify-between rounded-lg border px-4 py-3">
          <div>
            <span className="text-lg font-semibold">{s.score}</span>
            <span className="ml-3 text-sm text-gray-500">{s.date}</span>
          </div>
          <button
            onClick={() => deleteScore(s.id)}
            className="text-sm text-red-500 hover:text-red-700"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  )
}
