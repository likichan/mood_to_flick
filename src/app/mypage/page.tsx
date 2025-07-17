'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import Rating from '@/components/Rating';

export default function MyPage() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [ratings, setRatings] = useState<any[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  useEffect(() => {
    if (user) {
      supabase
        .from('ratings')
        .select('*, movies(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (!error) setRatings(data ?? []);
        });
    }
  }, [user]);

  if (user === undefined) return <div>Loading...</div>;
  if (user === null) return <div>ログインしてください</div>;

  if (ratings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 shadow-lg flex flex-col items-center max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4 text-white">まだ映画を評価していません</h2>
          <p className="mb-6 text-gray-300 text-center">まずは映画史で人気の映画を評価してみましょう！</p>
          <button
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-bold"
            onClick={() => window.location.href = '/'}
          >
            映画を評価する
          </button>
        </div>
      </div>
    );
  }

  // 評価変更時の保存処理
  const handleRatingChange = async (movie: any, rating: number) => {
    if (!user || rating === 0) return;
    await supabase.from('movies').upsert([
      {
        tmdb_id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
      }
    ], { onConflict: 'tmdb_id' });
    await supabase.from('ratings').upsert([
      {
        user_id: user.id,
        movie_id: movie.id,
        rating,
      }
    ], { onConflict: 'user_id,movie_id' });
    // 再取得
    const { data, error } = await supabase
      .from('ratings')
      .select('*, movies(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (!error) setRatings(data ?? []);
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6 text-white">あなたの評価履歴</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {ratings.map((r: any) => (
          <div key={r.id} className="bg-white/10 rounded-lg p-4 flex flex-col items-center shadow">
            <img
              src={r.movies?.poster_path
                ? `https://image.tmdb.org/t/p/w342${r.movies.poster_path}`
                : '/fallback.png'}
              alt={r.movies?.title}
              className="w-32 h-48 object-cover rounded mb-3 py-2"
            />
            <div className="text-xl font-bold text-white mb-1">{r.movies?.title}</div>
            <div className="text-xs text-gray-400 mb-2">{r.movies?.genres_list?.join(' / ')}</div>
            <Rating
              movieId={r.movies?.tmdb_id || r.movies?.id}
              value={r.rating}
              onChange={rating => handleRatingChange({
                id: r.movies?.tmdb_id || r.movies?.id,
                title: r.movies?.title,
                poster_path: r.movies?.poster_path,
              }, rating)}
            />
          </div>
        ))}
      </div>
    </div>
  );
} 