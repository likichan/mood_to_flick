// src/components/Rating.tsx
'use client';

import { useState, useEffect } from 'react';

type RatingProps = {
  movieId: number;
  value?: number;
  onChange?: (rating: number) => void;
};

export default function Rating({ movieId, value = 0, onChange }: RatingProps) {
  // ★の数（0～5）を状態で保持
  const [rating, setRating] = useState(value);

  // マウント時に保存済み評価を読み込む
  useEffect(() => {
    setRating(value);
  }, [value]);

  // クリックで評価を変更＆保存
  const handleRate = (star: number) => {
    const newRating = star === rating ? 0 : star;
    setRating(newRating); 
    if (onChange) onChange(newRating);
  };

  return (
    <div className="flex items-center gap-1 mt-3 justify-center mb-6">
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
