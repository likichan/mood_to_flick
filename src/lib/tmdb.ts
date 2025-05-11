// src/lib/tmdb.ts
const BASE = 'https://api.themoviedb.org/3';
const KEY  = process.env.TMDB_API_KEY!;

// タイトルで検索
export async function getTopRatedMovies(count = 4) {
  const res = await fetch(
    `${BASE}/movie/top_rated?` +
    new URLSearchParams({
      api_key: KEY,
      language: 'ja-JP',
      page: '1',
    }),
    { cache: 'no-store' }
  );
  const data = await res.json();
  return data.results.slice(0, count); // 映画オブジェクトの配列
}

// ID で詳細取得（runtime, credits なども取りたいとき）
export async function getMovieDetails(id: number) {
  const [detailRes, creditRes] = await Promise.all([
    fetch(`${BASE}/movie/${id}?` + new URLSearchParams({ api_key: KEY, language: 'ja-JP' }), { cache: 'no-store' }),
    fetch(`${BASE}/movie/${id}/credits?` + new URLSearchParams({ api_key: KEY, language: 'ja-JP' }), { cache: 'no-store' }),
  ]);
  const detail = await detailRes.json();
  const credits = await creditRes.json();
  return {
    ...detail,
    cast: credits.cast.slice(0, 5).map((c: any) => c.name),
  };
}
