import Link from "next/link"
import { Container } from "@/app/ui/common"
import { MobileNav } from "@/app/ui/mobile-nav"
import { cookies } from "next/headers"
import { decrypt } from "@/app/lib/session"
import type { ReactNode } from "react"

export default async function MarketingLayout({ children }: { children: ReactNode }) {
  const cookie = (await cookies()).get("session")?.value
  const session = cookie ? await decrypt(cookie) : null
  const loggedIn = !!session?.userId

  return (
    <div className="flex min-h-screen flex-col">
      <header className="fixed top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <Container className="flex h-16 items-center justify-between">
          <Link href="/" className="text-lg font-bold tracking-tight">
            Digital Heroes
          </Link>
          <div className="hidden md:flex md:items-center md:gap-6 md:text-sm">
            <Link href="/pricing" className="font-medium text-gray-600 transition-colors hover:text-black">
              Pricing
            </Link>
            <Link href="/charities" className="font-medium text-gray-600 transition-colors hover:text-black">
              Charities
            </Link>
            {loggedIn ? (
              <Link
                href={session?.role === "admin" ? "/admin" : "/dashboard"}
                className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="font-medium text-gray-600 transition-colors hover:text-black">
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
          <MobileNav loggedIn={loggedIn} role={session?.role as 'user' | 'admin' | undefined} />
        </Container>
      </header>

      <main className="flex-1 pt-16">{children}</main>

      <footer className="border-t py-8">
        <Container className="flex items-center justify-between text-sm text-gray-400">
          <span>&copy; {new Date().getFullYear()} Digital Heroes</span>
          <div className="flex gap-6">
            <Link href="/pricing" className="transition-colors hover:text-gray-600">
              Pricing
            </Link>
            <Link href="/charities" className="transition-colors hover:text-gray-600">
              Charities
            </Link>
          </div>
        </Container>
      </footer>
    </div>
  )
}