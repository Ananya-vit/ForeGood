import Link from "next/link";
import { verifySession } from "@/app/lib/dal";
import { logout } from "@/app/actions/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await verifySession();

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 flex-col border-r bg-gray-50 p-4">
        <Link href="/dashboard" className="mb-6 text-lg font-bold">
          Digital Heroes
        </Link>
        <nav className="flex flex-1 flex-col gap-1 text-sm">
          <Link href="/dashboard" className="rounded-md px-3 py-2 hover:bg-gray-200">
            Dashboard
          </Link>
          <Link href="/dashboard/scores" className="rounded-md px-3 py-2 hover:bg-gray-200">
            Scores
          </Link>
          <Link href="/dashboard/settings" className="rounded-md px-3 py-2 hover:bg-gray-200">
            Settings
          </Link>
        </nav>
        <form action={logout}>
          <button type="submit" className="w-full rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50">
            Sign out
          </button>
        </form>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
