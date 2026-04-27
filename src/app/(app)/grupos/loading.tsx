export default function GruposLoading() {
  return (
    <div className="flex flex-col gap-4 p-4 animate-pulse">
      <div className="flex gap-2">
        {["A", "B", "C", "D"].map((g) => (
          <div key={g} className="h-9 w-12 rounded-lg bg-surface-3" />
        ))}
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-14 rounded-xl bg-surface-3" />
      ))}
    </div>
  );
}
