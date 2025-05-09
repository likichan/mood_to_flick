'use client'

type Props={
  thumbnail:string;
  title: string;
  year: string;
  actors: string[];
  duration: string; // 104min
  genre: string;
  description: string;
  onClick: () => void;
}

export default function MovieCard ({thumbnail, title, year, actors, duration, genre, description, onClick}: Props){
  return (
    <div onClick={onClick}>
      <h3>{title}</h3>
      <p>{year}</p>
      <p>{actors}</p>
      <p>{duration}</p>
      <p>{genre}</p>
      <p>{description}</p>
    </div>
  );
}