'use client';

import Rating from '@/components/Rating';

type Props = {
  id: number;
  thumbnail: string;
  title: string;
  year: string;
  actors: string[];
  duration: string;
  genre: string[];
  description: string;
  onClick?: () => void;
};

export default function MovieCard({
  id,
  thumbnail,
  title,
  year,
  actors,
  duration,
  genre,
  description,
  onClick,
}: Props) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
    >
      {/* 画像に余白をつけつつ、アスペクト比を固定し、object-containで全体表示 */}
      <div className="p-4 bg-white/5 flex items-center justify-center">
        <img
          src={thumbnail}
          alt={title}
          className="w-full object-contain"
        />
      </div>

      {/* テキスト部分にも余白 */}
      <div className="p-8 text-white space-y-2">
        <h3 className="text-3xl font-bold">{title}</h3>
        <p className="text-sm text-white/70">
          {year}年 ・ {duration}
        </p>
        <p className="text-sm text-white/60">
          ジャンル: {genre.join(' / ')}
        </p>
        <p className="text-sm">{description}</p>
        <p className="text-xs text-white/50">
          出演: {actors.join(', ')}
        </p>
      </div>

      
      <Rating movieId={id} />
    </div>
  );
}
