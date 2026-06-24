export function StatCard({ label, value, suffix = "" }: { label: string; value: string; suffix?: string }) {
  return (
    <div className="text-center">
      <p className="text-4xl font-bold tracking-tight">
        {value}
        <span className="text-gray-400">{suffix}</span>
      </p>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
    </div>
  )
}
