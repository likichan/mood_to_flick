'use client';

import { useEffect, useState } from 'react';
import { getAllRatings, StoredRating } from '@/lib/ratings';

export default function RatingsPage() {
  const [data, setData] = useState<StoredRating[]>([]);

  useEffect(() => {
    setData(getAllRatings());
  }, []);

  // JSONダウンロード用
  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'ratings.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // CSVダウンロード用
  const downloadCSV = () => {
    const header = ['movieId', 'rating'];
    const rows   = data.map((r) => [r.movieId, r.rating].join(','));
    const csv    = [header.join(','), ...rows].join('\n');
    const blob   = new Blob([csv], { type: 'text/csv' });
    const url    = URL.createObjectURL(blob);
    const a      = document.createElement('a');
    a.href       = url;
    a.download   = 'ratings.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">あなたの評価した映画一覧</h1>
      {data.length === 0 ? (
        <p>まだ★評価がありません。</p>
      ) : (
        <>
          <ul className="list-disc pl-5 space-y-2">
            {data.map(({ movieId, rating }) => (
              <li key={movieId}>
                映画ID <strong>{movieId}</strong> に ★{rating} 点
              </li>
            ))}
          </ul>

          <div className="mt-6 flex gap-4">
            <button
              onClick={downloadJSON}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              JSON でダウンロード
            </button>
            <button
              onClick={downloadCSV}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              CSV でダウンロード
            </button>
          </div>
        </>
      )}
    </main>
  );
}
