import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Rating from './Rating';
import type { User } from '@supabase/supabase-js';

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_POPULAR_URL = `https://api.themoviedb.org/3/movie/popular?language=ja-JP&api_key=${TMDB_API_KEY}`;
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

const POPULAR_CLASSICS_URL = 'http://localhost:8000/popular_classics';

export default function NoRatingsYet({ user, onFinish }: { user: User, onFinish: () => void }) {
  const [popularMovies, setPopularMovies] = useState<any[]>([]);
  const [ratings, setRatings] = useState<{ [movieId: number]: number }>({});

  useEffect(() => {
    fetch(POPULAR_CLASSICS_URL)
      .then(res => res.json())
      .then(data => setPopularMovies(data.movies || []));
  }, []);

  const handleRate = (movieId: number, rating: number) => {
    setRatings(prev => ({ ...prev, [movieId]: rating }));
  };

  const handleFinish = async () => {
    const entries = Object.entries(ratings).filter(([_, rating]) => rating > 0);
    if (entries.length === 0) {
      alert('1本以上評価してください');
      return;
    }
    // 1. moviesテーブルにupsert
    const moviesToSave = popularMovies
      .filter(movie => ratings[movie.id] > 0)
      .map(movie => {
        // poster_pathが無ければthumbnailから抽出
        let poster_path = movie.poster_path;
        if (!poster_path && movie.thumbnail && movie.thumbnail.startsWith('https://image.tmdb.org/t/p/')) {
          poster_path = movie.thumbnail.replace('https://image.tmdb.org/t/p/w342', '');
          poster_path = poster_path.replace('https://image.tmdb.org/t/p/w500', '');
        }
        return {
          tmdb_id: movie.id,
          title: movie.title,
          poster_path,
        };
      });
    if (moviesToSave.length > 0) {
      const { error: movieError, data: movieUpsertData } = await supabase
        .from('movies')
        .upsert(moviesToSave, { onConflict: 'tmdb_id' });
      console.log('movies upsert result:', movieUpsertData, movieError);
      if (movieError) {
        console.error('moviesテーブルupsertエラー:', movieError);
        alert('moviesテーブルへの保存に失敗しました');
        return;
      }
    }
    // 2. moviesテーブルからtmdb_id→idのマッピングを取得
    const tmdbIds = Object.keys(ratings).map(Number);
    const { data: movieRows, error: selectError } = await supabase
      .from('movies')
      .select('tmdb_id')
      .in('tmdb_id', tmdbIds);
    console.log('movies select result:', movieRows, selectError);
    if (selectError) {
      console.error('moviesテーブルselectエラー:', selectError);
      alert('moviesテーブルの取得に失敗しました');
      return;
    }
    // 3. ratingsテーブルに保存
    const toSave = Object.entries(ratings)
      .filter(([_, rating]) => rating > 0)
      .map(([tmdb_id, rating]) => ({
        user_id: user.id,
        movie_id: Number(tmdb_id), // tmdb_idで保存
        rating,
      }));
    console.log('ratings to save:', toSave);
    const { error: ratingError, data: ratingUpsertData } = await supabase
      .from('ratings')
      .upsert(toSave, { onConflict: 'user_id,movie_id' });
    console.log('ratings upsert result:', ratingUpsertData, ratingError);
    if (ratingError) {
      console.error('Supabase保存エラー:', ratingError);
      alert('保存に失敗しました');
      return;
    }
    onFinish();
  };

  return (
    <div className="flex flex-col items-center py-8">
      <div className="text-2xl mb-4">まだ映画を評価していません</div>
      <div className="mb-6 text-gray-400">まずは映画史で人気の映画を評価してみましょう！</div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {popularMovies.map(movie => (
          <div key={movie.id} className="flex flex-col items-center bg-white/10 rounded-lg p-6 shadow w-full">
            <img src={movie.thumbnail} alt={movie.title} className="w-32 h-48 object-cover rounded mb-2" />
            <div className="mt-2 text-white text-base font-bold text-center">{movie.title}</div>
            <Rating
              movieId={movie.id}
              value={ratings[movie.id] || 0}
              onChange={rating => handleRate(movie.id, rating)}
            />
          </div>
        ))}
      </div>
      <button
        className="mt-8 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        onClick={handleFinish}
      >
        評価を終える
      </button>
    </div>
  );
} 