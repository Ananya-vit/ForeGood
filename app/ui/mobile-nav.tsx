'use client'

import { useState } from 'react'
import Link from 'next/link'

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="rounded-md border bg-white p-2 text-sm md:hidden"
        aria-label="Toggle menu"
      >
        {open ? '✕' : '☰'}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-16 z-50 border-b bg-white shadow-lg md:hidden">
          <nav className="flex flex-col gap-3 px-6 py-4 text-sm">
            <Link href="/pricing" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 hover:bg-gray-100">
              Pricing
            </Link>
            <Link href="/charities" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 hover:bg-gray-100">
              Charities
            </Link>
            <Link href="/login" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 hover:bg-gray-100">
              Sign in
            </Link>
            <Link
              href="/signup"
              onClick={() => setOpen(false)}
              className="rounded-full bg-black px-5 py-2.5 text-center text-sm font-medium text-white"
            >
              Get started
            </Link>
          </nav>
        </div>
      )}
    </>
  )
}