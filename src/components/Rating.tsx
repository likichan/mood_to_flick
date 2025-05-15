// src/components/Rating.tsx
'use client';

import { useState, useEffect } from 'react';

type RatingProps = {
  movieId: number;
};

export default function Rating({ movieId }: RatingProps) {
  // ★の数（0～5）を状態で保持
  const [rating, setRating] = useState(0);

  // マウント時に保存済み評価を読み込む
  useEffect(() => {
    const saved = localStorage.getItem(`rating_${movieId}`);
    if (saved) setRating(Number(saved));
  }, [movieId]);

  // クリックで評価を変更＆保存
  const handleRate = (star: number) => {
    const newRating = star === rating ? 0 : star;
    setRating(newRating); 
    localStorage.setItem(`rating_${movieId}`, String(star));
  };

  return (
    <div className="flex items-center gap-1 mt-3">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          onClick={() => handleRate(n)}
          className="text-2xl focus:outline-none"
        >
          {n <= rating ? '★' : '☆'}
        </button>
      ))}
    </div>
  );
}
