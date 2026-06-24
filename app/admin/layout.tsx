import Link from "next/link";
import { verifySession } from "@/app/lib/dal";
import { logout } from "@/app/actions/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await verifySession();

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 flex-col border-r bg-gray-50 p-4">
        <Link href="/admin" className="mb-6 text-lg font-bold">
          Admin Panel
        </Link>
        <nav className="flex flex-1 flex-col gap-1 text-sm">
          <Link href="/admin" className="rounded-md px-3 py-2 hover:bg-gray-200">
            Overview
          </Link>
          <Link href="/admin/users" className="rounded-md px-3 py-2 hover:bg-gray-200">
            Users
          </Link>
          <Link href="/admin/draws" className="rounded-md px-3 py-2 hover:bg-gray-200">
            Draws
          </Link>
          <Link href="/admin/charities" className="rounded-md px-3 py-2 hover:bg-gray-200">
            Charities
          </Link>
          <Link href="/admin/winners" className="rounded-md px-3 py-2 hover:bg-gray-200">
            Winners
          </Link>
          <Link href="/admin/reports" className="rounded-md px-3 py-2 hover:bg-gray-200">
            Reports
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
