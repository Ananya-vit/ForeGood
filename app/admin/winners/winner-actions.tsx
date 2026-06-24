'use client'

import { useTransition } from "react"
import { approveWinner, rejectWinner, markPaid } from "@/app/actions/winners"

export function WinnerActions({
  id,
  adminStatus,
  paymentStatus,
}: {
  id: string
  adminStatus: string
  paymentStatus: string
}) {
  const [pendingAdmin, startAdmin] = useTransition()
  const [pendingPay, startPay] = useTransition()

  return (
    <div className="mt-3 flex gap-2">
      {adminStatus === "pending" && (
        <>
          <button
            onClick={() => startAdmin(() => approveWinner(id))}
            disabled={pendingAdmin}
            className="rounded-full bg-green-600 px-4 py-1.5 text-xs font-medium text-white disabled:opacity-50"
          >
            {pendingAdmin ? "..." : "Approve"}
          </button>
          <button
            onClick={() => startAdmin(() => rejectWinner(id))}
            disabled={pendingAdmin}
            className="rounded-full bg-red-600 px-4 py-1.5 text-xs font-medium text-white disabled:opacity-50"
          >
            {pendingAdmin ? "..." : "Reject"}
          </button>
        </>
      )}
      {adminStatus === "approved" && paymentStatus === "pending" && (
        <button
          onClick={() => startPay(() => markPaid(id))}
          disabled={pendingPay}
          className="rounded-full bg-blue-600 px-4 py-1.5 text-xs font-medium text-white disabled:opacity-50"
        >
          {pendingPay ? "..." : "Mark paid"}
        </button>
      )}
    </div>
  )
}
