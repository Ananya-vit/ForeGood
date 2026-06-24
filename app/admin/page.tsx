export default function AdminOverviewPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Admin Overview</h1>
      <p className="mt-1 text-gray-500">Manage the platform</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border p-5">
          <h2 className="font-semibold">Total Users</h2>
          <p className="mt-1 text-2xl font-bold">0</p>
        </div>
        <div className="rounded-xl border p-5">
          <h2 className="font-semibold">Prize Pool</h2>
          <p className="mt-1 text-2xl font-bold">$0</p>
        </div>
        <div className="rounded-xl border p-5">
          <h2 className="font-semibold">Charity Contributions</h2>
          <p className="mt-1 text-2xl font-bold">$0</p>
        </div>
      </div>
    </div>
  );
}
