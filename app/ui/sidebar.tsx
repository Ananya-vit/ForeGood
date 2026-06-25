'use client'

import { useState } from 'react'
import Link from 'next/link'
import { logout } from '@/app/actions/auth'

type NavItem = { href: string; label: string }

export function Sidebar({ brand, navItems, admin }: { brand: { href: string; label: string }; navItems: NavItem[]; admin?: boolean }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed left-4 top-3 z-50 rounded-md border bg-white p-2 text-sm md:hidden"
        aria-label="Toggle navigation"
      >
        {open ? '✕' : '☰'}
      </button>

      {/* Overlay backdrop */}
      {open && <div className="fixed inset-0 z-30 bg-black/20 md:hidden" onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-56 flex-col border-r bg-gray-50 p-4 transition-transform duration-200 md:static md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Link href={brand.href} className="mb-6 text-lg font-bold">
          {brand.label}
        </Link>
        <nav className="flex flex-1 flex-col gap-1 text-sm">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 hover:bg-gray-200"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <form action={logout}>
          <button type="submit" className="w-full rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50">
            Sign out
          </button>
        </form>
      </aside>
    </>
  )
}