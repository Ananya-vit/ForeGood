'use client'

import { useActionState, useRef } from 'react'
import { submitProof } from '@/app/actions/winners'

export function ProofSubmission({
  winnerId,
  currentProofUrl,
  adminStatus,
}: {
  winnerId: string
  currentProofUrl: string | null
  adminStatus: string
}) {
  const [state, action, pending] = useActionState(submitProof, { success: false })
  const ref = useRef<HTMLFormElement>(null)

  if (currentProofUrl && adminStatus === 'pending') {
    return (
      <div className="mt-2">
        <p className="text-xs text-gray-400 mb-1">Screenshot submitted:</p>
        <img src={currentProofUrl} alt="Proof screenshot" className="max-h-32 rounded border object-contain" />
      </div>
    )
  }

  if (adminStatus !== 'pending') {
    return null
  }

  return (
    <form ref={ref} action={async (fd) => { await action(fd); ref.current?.reset() }} className="mt-2">
      <input type="hidden" name="winnerId" value={winnerId} />
      <div className="flex flex-wrap items-center gap-2">
        <input
          name="proofImage"
          type="file"
          accept="image/*"
          required
          className="block w-full text-xs text-gray-500 file:mr-2 file:rounded file:border file:px-2 file:py-1 file:text-xs file:font-medium hover:file:bg-gray-50"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-black px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
        >
          {pending ? '...' : 'Upload proof'}
        </button>
      </div>
      {state?.error && <p className="mt-1 text-xs text-red-500">{state.error}</p>}
      {state?.success && <p className="mt-1 text-xs text-green-600">Proof uploaded!</p>}
    </form>
  )
}
