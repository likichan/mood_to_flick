'use client';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import NoRatingsYet from '@/components/NoRatingsYet';
import MovieCard from './MovieCard'; // 追加
import { useRouter } from 'next/navigation'; // 追加
import Rating from '@/components/Rating';

export default function RecommendPage() {
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [movies, setMovies] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const router = useRouter(); // 追加
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  // 推薦APIを叩く関数
  const fetchRecommendations = () => {
    if (!user) return; // userがnull/undefinedなら何もしない
    fetch('http://localhost:8000/recommend_by_rating', {
      method: 'POST',
      body: JSON.stringify({ user_id: user.id }),
      headers: { 'Content-Type': 'application/json' }
    })
      .then(async res => {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return res.json();
        } else {
          const text = await res.text();
          throw new Error('APIからJSON以外のレスポンス: ' + text);
        }
      })
      .then(data => {
        console.log('推薦APIレスポンス:', data);
        setMovies(data.recommendations);
      })
      .catch(e => {
        console.error(e);
        setMovies([]);
      });
  };

  // userがセットされたときだけ初回fetch
  useEffect(() => {
    if (user) {
      fetchRecommendations();
    }
  }, [user]);

  // refreshKeyが変わったときだけ再fetch
  useEffect(() => {
    if (user && refreshKey > 0) {
      fetchRecommendations();
    }
  }, [refreshKey]);

  const handleNoRatingsFinish = () => {
    setLoading(true);
    setRefreshKey(k => k + 1);
  };

  if (user === undefined) return <div>Loading...</div>;
  if (user === null) return <div>ログインしてください</div>;
  if (loading) return <div>Loading...</div>;

  // MovieCardで評価が変わったときの保存処理
  const handleRatingChange = async (movie: any, rating: number) => {
    if (!user || rating === 0) return;
    // moviesテーブルにupsert
    await supabase.from('movies').upsert([
      {
        tmdb_id: movie.id,
        title: movie.title,
        poster_path: movie.thumbnail,
      }
    ], { onConflict: 'tmdb_id' });
    // ratingsテーブルにupsert
    await supabase.from('ratings').upsert([
      {
        user_id: user.id,
        movie_id: movie.id,
        rating,
      }
    ], { onConflict: 'user_id,movie_id' });
    // 新しい推薦を取得
    setRefreshKey(k => k + 1);
  };

  return (
    <div>
      <h2>あなたへのおすすめ映画</h2>
      {movies.length === 0
        ? <NoRatingsYet user={user as User} onFinish={handleNoRatingsFinish} />
        : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {movies.map((movie: any) => (
                <MovieCard
                  key={movie.id}
                  id={movie.id}
                  thumbnail={movie.thumbnail}
                  title={movie.title}
                  year={movie.year}
                  actors={movie.actors}
                  duration={movie.duration || ''}
                  genre={movie.genre}
                  description={movie.description}
                  onRatingChange={handleRatingChange}
                />
              ))}
            </div>
            {/* 推薦映画の下にボタンを配置 */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', margin: '2rem 0' }}>
              <button
                onClick={() => setRefreshKey(k => k + 1)}
                style={{
                  padding: '0.5rem 1.5rem',
                  borderRadius: '6px',
                  border: '1px solid #888',
                  background: '#fff',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  transition: 'background 0.2s, color 0.2s',
                  color: '#000', // デフォルト文字色を黒に
                }}
                onMouseOver={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#f0f0f0';
                  (e.currentTarget as HTMLButtonElement).style.color = '#0070f3';
                }}
                onMouseOut={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#fff';
                  (e.currentTarget as HTMLButtonElement).style.color = '#000'; // マウスアウト時は黒に戻す
                }}
              >
                もう一度選び直す
              </button>
              <button
                onClick={() => router.push('/mood')}
                style={{
                  padding: '0.5rem 1.5rem',
                  borderRadius: '6px',
                  border: '1px solid #888',
                  background: '#fff',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  transition: 'background 0.2s, color 0.2s',
                  color: '#000', // デフォルト文字色を黒に
                }}
                onMouseOver={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#f0f0f0';
                  (e.currentTarget as HTMLButtonElement).style.color = '#0070f3';
                }}
                onMouseOut={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#fff';
                  (e.currentTarget as HTMLButtonElement).style.color = '#000'; // マウスアウト時は黒に戻す
                }}
              >
                気分を選び直す
              </button>
            </div>
          </>
        )
      }
    </div>
  );
}