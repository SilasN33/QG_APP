export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-4 p-4 animate-pulse">
      <div className="h-24 rounded-2xl bg-surface-3" />
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-surface-3" />
        ))}
      </div>
      <div className="h-40 rounded-2xl bg-surface-3" />
      <div className="h-40 rounded-2xl bg-surface-3" />
    </div>
  );
}
