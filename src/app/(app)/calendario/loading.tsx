export default function CalendarioLoading() {
  return (
    <div className="flex flex-col gap-3 p-4 animate-pulse">
      <div className="h-10 w-48 rounded-lg bg-surface-3" />
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-20 rounded-xl bg-surface-3" />
      ))}
    </div>
  );
}
