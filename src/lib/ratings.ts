export type StoredRating = {
  movieId: number;
  rating:   number;
};

export function getAllRatings(): StoredRating[] {
  return Object.keys(localStorage)
    .filter((key) => key.startsWith('rating_'))
    .map((key) => ({
      movieId: Number(key.replace('rating_', '')),
      rating:  Number(localStorage.getItem(key)),
    }));
}
