'use client'

import { useTransition } from "react"
import { toggleUserRole } from "@/app/actions/admin"

export function UserActions({ userId, currentRole }: { userId: string; currentRole: string }) {
  const [pending, startTransition] = useTransition()

  return (
    <button
      onClick={() => startTransition(() => { toggleUserRole(userId) })}
      disabled={pending}
      className="rounded-full border px-3 py-1 text-xs font-medium disabled:opacity-50"
    >
      {pending ? "..." : currentRole === "admin" ? "Demote" : "Make admin"}
    </button>
  )
}
