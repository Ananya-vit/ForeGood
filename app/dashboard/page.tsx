import { getUser } from "@/app/lib/dal";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await getUser();
  const subscription = await prisma.subscription.findFirst({
    where: { userId: user!.id, status: "active" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
      <p className="mt-1 text-gray-500">Your dashboard</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border p-5">
          <h2 className="font-semibold">Subscription</h2>
          {subscription ? (
            <div className="mt-1 text-sm">
              <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                Active
              </span>
              <p className="mt-1 text-gray-500 capitalize">{subscription.plan} plan</p>
              <p className="text-gray-400 text-xs">
                Renews {new Date(subscription.currentPeriodEnd!).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <div className="mt-1 text-sm">
              <span className="inline-block rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
                No active plan
              </span>
              <p className="mt-1 text-gray-500">
                <Link href="/pricing" className="underline">Subscribe</Link> to unlock features
              </p>
            </div>
          )}
        </div>

        <div className="rounded-xl border p-5">
          <h2 className="font-semibold">Scores</h2>
          <p className="mt-1 text-sm text-gray-500">Enter your latest scores</p>
        </div>

        <div className="rounded-xl border p-5">
          <h2 className="font-semibold">Charity</h2>
          <p className="mt-1 text-sm text-gray-500">Supporting a cause</p>
        </div>

        <div className="rounded-xl border p-5">
          <h2 className="font-semibold">Draws</h2>
          <p className="mt-1 text-sm text-gray-500">Your participation</p>
        </div>

        <div className="rounded-xl border p-5">
          <h2 className="font-semibold">Winnings</h2>
          <p className="mt-1 text-sm text-gray-500">Total won: $0</p>
        </div>
      </div>
    </div>
  );
}
