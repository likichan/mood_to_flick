// app/recommend/loading.tsx
export default function Loading() {
  return (
    <div className="p-8">
      <p className="mb-4 text-white">映画を探しています…</p>
      <div className="grid grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-64 bg-white/10 rounded-lg animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
