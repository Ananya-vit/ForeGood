import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <span className="text-xl font-bold tracking-tight">Digital Heroes</span>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/login" className="font-medium underline underline-offset-4">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white"
          >
            Subscribe
          </Link>
        </nav>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          Every swing makes a difference
        </h1>
        <p className="mt-4 max-w-lg text-lg text-gray-500">
          Track your golf scores, enter monthly draws, and support the charity you care about — all in one place.
        </p>
        <div className="mt-8 flex gap-4">
          <Link
            href="/signup"
            className="rounded-full bg-black px-8 py-3 text-sm font-medium text-white"
          >
            Get started
          </Link>
          <Link
            href="/login"
            className="rounded-full border px-8 py-3 text-sm font-medium"
          >
            Sign in
          </Link>
        </div>
      </main>

      <footer className="px-6 py-4 text-center text-sm text-gray-400">
        &copy; {new Date().getFullYear()} Digital Heroes
      </footer>
    </div>
  );
}
