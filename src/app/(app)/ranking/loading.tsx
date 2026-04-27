export default function RankingLoading() {
  return (
    <div className="flex flex-col gap-3 p-4 animate-pulse">
      <div className="h-10 w-40 rounded-lg bg-surface-3" />
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-16 rounded-xl bg-surface-3" />
      ))}
    </div>
  );
}
