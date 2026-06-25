'use client'

import { useActionState, useState, useTransition } from 'react'
import {
  toggleUserRole,
  updateUserProfile,
  adminAddScore,
  adminUpdateScore,
  adminDeleteScore,
  cancelSubscription,
} from '@/app/actions/admin'

type ScoreItem = { id: string; score: number; date: string }
type SubItem = { id: string; plan: string; status: string; currentPeriodEnd: string | null; charityName: string | null; charityPct: number }

export function UserRow({
  user,
  scores,
  subscriptions,
}: {
  user: { id: string; name: string; email: string; role: string }
  scores: ScoreItem[]
  subscriptions: SubItem[]
}) {
  const [open, setOpen] = useState(false)
  const [rolePending, startRole] = useTransition()

  const [profileState, profileAction, profilePending] = useActionState(updateUserProfile, { success: false })
  const [addScoreState, addScoreAction, addPending] = useActionState(adminAddScore, { success: false })
  const [editScoreId, setEditScoreId] = useState<string | null>(null)
  const [editScoreState, editScoreAction, editPending] = useActionState(adminUpdateScore, { success: false })

  return (
    <div className="rounded-lg border">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
        <div className="flex-1">
          <p className="font-medium">{user.name}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-400">
            <span>{user.role}</span>
            <span>{scores.length} scores</span>
            {subscriptions.map(s => (
              <span key={s.id} className="rounded-full bg-green-100 px-2 py-0.5 font-medium text-green-700">
                {s.plan}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setOpen(!open)} className="rounded-full border px-3 py-1 text-xs font-medium hover:bg-gray-50">
            {open ? 'Close' : 'Manage'}
          </button>
          <button
            onClick={() => startRole(() => toggleUserRole(user.id))}
            disabled={rolePending}
            className="rounded-full border px-3 py-1 text-xs font-medium disabled:opacity-50"
          >
            {rolePending ? '...' : user.role === 'admin' ? 'Demote' : 'Make admin'}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t px-4 py-4 space-y-6">
          {/* Profile edit */}
          <details open>
            <summary className="cursor-pointer text-sm font-medium text-gray-600">Edit profile</summary>
            <form action={profileAction} className="mt-3 flex flex-wrap items-end gap-3">
              <input type="hidden" name="userId" value={user.id} />
              <div>
                <label className="block text-xs text-gray-500">Name</label>
                <input name="name" defaultValue={user.name} required className="mt-1 rounded border px-2 py-1 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500">Email</label>
                <input name="email" type="email" defaultValue={user.email} required className="mt-1 rounded border px-2 py-1 text-sm" />
              </div>
              <button type="submit" disabled={profilePending} className="rounded bg-black px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50">
                {profilePending ? '...' : 'Save'}
              </button>
              {profileState?.success && <span className="text-xs text-green-600">Saved</span>}
              {profileState?.error && <span className="text-xs text-red-500">{profileState.error}</span>}
            </form>
          </details>

          {/* Scores */}
          <details open>
            <summary className="cursor-pointer text-sm font-medium text-gray-600">Scores</summary>
            <div className="mt-3 space-y-2">
              {scores.length === 0 ? (
                <p className="text-xs text-gray-400">No scores.</p>
              ) : (
                scores.map(s => (
                  <div key={s.id} className="flex items-center justify-between rounded border px-3 py-2">
                    {editScoreId === s.id ? (
                      <form action={editScoreAction} className="flex flex-wrap items-center gap-2 w-full">
                        <input type="hidden" name="id" value={s.id} />
                        <input name="score" type="number" min="1" max="45" defaultValue={s.score} required className="w-16 rounded border px-2 py-1 text-sm" />
                        <input name="date" type="date" defaultValue={s.date} required className="rounded border px-2 py-1 text-sm" />
                        <button type="submit" disabled={editPending} className="rounded bg-black px-2 py-1 text-xs text-white disabled:opacity-50">
                          {editPending ? '...' : 'Save'}
                        </button>
                        <button type="button" onClick={() => setEditScoreId(null)} className="text-xs text-gray-500">Cancel</button>
                        {editScoreState?.error && <span className="text-xs text-red-500">{editScoreState.error}</span>}
                      </form>
                    ) : (
                      <>
                        <span className="text-sm"><b>{s.score}</b> <span className="text-gray-500">{s.date}</span></span>
                        <div className="flex gap-2">
                          <button onClick={() => setEditScoreId(s.id)} className="text-xs text-gray-500 hover:text-gray-700">Edit</button>
                          <button onClick={() => adminDeleteScore(s.id)} className="text-xs text-red-500 hover:text-red-700">Delete</button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}

              {/* Add score */}
              <form action={addScoreAction} className="mt-3 flex flex-wrap items-end gap-2 border-t pt-3">
                <input type="hidden" name="userId" value={user.id} />
                <div>
                  <label className="block text-xs text-gray-500">Add score</label>
                  <input name="score" type="number" min="1" max="45" required placeholder="1-45" className="mt-1 w-16 rounded border px-2 py-1 text-sm" />
                </div>
                <div>
                  <input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="rounded border px-2 py-1 text-sm" />
                </div>
                <button type="submit" disabled={addPending} className="rounded bg-black px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50">
                  {addPending ? '...' : 'Add'}
                </button>
                {addScoreState?.success && <span className="text-xs text-green-600">Added</span>}
                {addScoreState?.error && <span className="text-xs text-red-500">{addScoreState.error}</span>}
              </form>
            </div>
          </details>

          {/* Subscriptions */}
          <details open>
            <summary className="cursor-pointer text-sm font-medium text-gray-600">Subscriptions</summary>
            {subscriptions.length === 0 ? (
              <p className="mt-2 text-xs text-gray-400">No subscriptions.</p>
            ) : (
              <div className="mt-3 space-y-2">
                {subscriptions.map(s => (
                  <div key={s.id} className="flex flex-wrap items-center justify-between gap-1 rounded border px-3 py-2 text-sm">
                    <div>
                      <b className="capitalize">{s.plan}</b>
                      <span className={`ml-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        s.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>{s.status}</span>
                      {s.currentPeriodEnd && <span className="ml-2 text-xs text-gray-400">until {new Date(s.currentPeriodEnd).toLocaleDateString()}</span>}
                      {s.charityName && <span className="ml-2 text-xs text-gray-400">· {s.charityName} ({s.charityPct}%)</span>}
                    </div>
                    {s.status === 'active' && (
                      <button onClick={() => cancelSubscription(s.id)} className="text-xs text-red-500 hover:text-red-700">Cancel</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </details>
        </div>
      )}
    </div>
  )
}