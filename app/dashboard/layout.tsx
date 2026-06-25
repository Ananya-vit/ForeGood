import { verifySession } from "@/app/lib/dal";
import { Sidebar } from "@/app/ui/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await verifySession();

  return (
    <div className="flex min-h-screen">
      <Sidebar
        brand={{ href: "/dashboard", label: "Digital Heroes" }}
        navItems={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/dashboard/scores", label: "Scores" },
          { href: "/dashboard/settings", label: "Settings" },
        ]}
      />
      <main className="flex-1 p-4 pt-12 md:p-8 md:pt-8">{children}</main>
    </div>
  );
}
