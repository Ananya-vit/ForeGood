import { getUser } from "@/app/lib/dal";

export default async function DashboardPage() {
  const user = await getUser();

  return (
    <div>
      <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
      <p className="mt-1 text-gray-500">Your dashboard</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border p-5">
          <h2 className="font-semibold">Subscription</h2>
          <p className="mt-1 text-sm text-gray-500">Active · Monthly plan</p>
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
