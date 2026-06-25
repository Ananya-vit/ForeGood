import { verifySession } from "@/app/lib/dal";
import { Sidebar } from "@/app/ui/sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await verifySession();

  return (
    <div className="flex min-h-screen">
      <Sidebar
        brand={{ href: "/admin", label: "Admin Panel" }}
        navItems={[
          { href: "/admin", label: "Overview" },
          { href: "/admin/users", label: "Users" },
          { href: "/admin/draws", label: "Draws" },
          { href: "/admin/charities", label: "Charities" },
          { href: "/admin/winners", label: "Winners" },
          { href: "/admin/reports", label: "Reports" },
        ]}
        admin
      />
      <main className="flex-1 p-4 pt-12 md:p-8 md:pt-8">{children}</main>
    </div>
  );
}
