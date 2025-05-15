// src/app/recommend/page.tsx
import Link from 'next/link';
import MovieCard from '../recommend/MovieCard';
import { getTopRatedMovies, getMovieDetails } from '@/lib/tmdb';

type PageProps = {
  searchParams: { mood?: string };
};

export default async function RecommendPage({ searchParams }: PageProps) {
  const mood = searchParams.mood ?? '-';

  // ① 高評価ランキング上位4件を取得
  const tops = await getTopRatedMovies(4);

  // ② 各映画の詳細情報（runtime, cast, genres）を並行取得して整形
  const movies = await Promise.all(
    tops.map(async (m) => {
      const detail = await getMovieDetails(m.id);
      return {
        id:          m.id,
        thumbnail:   m.poster_path
                      ? `https://image.tmdb.org/t/p/w342${m.poster_path}`
                      : '/fallback.png',
        title:       m.title,
        year:        m.release_date?.slice(0, 4) ?? '',
        actors:      detail.cast,
        duration:    `${detail.runtime}分`,
        genre:       detail.genres.map((g: any) => g.name),
        description: m.overview,
      };
    })
  );

  return (
    <main className="p-8 text-white">
      <h1 className="text-3xl font-bold mb-6">
        「{mood}」におすすめの映画トップ4
      </h1>

      {/* ────────── 映画カードをグリッドで並べる ────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            id={movie.id}
            thumbnail={movie.thumbnail}
            title={movie.title}
            year={movie.year}
            actors={movie.actors}
            duration={movie.duration}
            genre={movie.genre}
            description={movie.description}
          />
        ))}
      </div>

      {/* ────────── ページ下部に一度だけ表示するボタン群 ────────── */}
      <div className="flex justify-center gap-4 mt-8">
        {/* トップに戻って気分選び直し */}
        <Link
          href="/"
          className="px-5 py-2 bg-blue-600 rounded hover:bg-blue-700 transition"
        >
          気分を選び直す
        </Link>

        {/* 同じ気分で再検索 */}
        <Link
          href={`/recommend?mood=${encodeURIComponent(mood)}`}
          className="px-5 py-2 bg-green-600 rounded hover:bg-green-700 transition"
        >
          もう一度探す
        </Link>
      </div>
    </main>
  );
}
