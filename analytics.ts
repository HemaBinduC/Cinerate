import type { Movie, Rating, MovieStats, Genre } from '@/types';
import { MOVIES, MIN_RATINGS_FOR_TOP } from '@/data';

export function getMovieById(id: number): Movie | undefined {
  return MOVIES.find((m) => m.movie_id === id);
}

export function ratingsForMovie(ratings: Rating[], movieId: number): Rating[] {
  return ratings.filter((r) => r.movie_id === movieId);
}

export function averageForMovie(ratings: Rating[], movieId: number): number {
  const rs = ratingsForMovie(ratings, movieId);
  if (rs.length === 0) return 0;
  return rs.reduce((s, r) => s + r.rating, 0) / rs.length;
}

export function countForMovie(ratings: Rating[], movieId: number): number {
  return ratingsForMovie(ratings, movieId).length;
}

export function movieStats(ratings: Rating[]): MovieStats[] {
  return MOVIES.map((movie) => ({
    movie,
    average: averageForMovie(ratings, movie.movie_id),
    count: countForMovie(ratings, movie.movie_id),
  }));
}

// Movies that meet the minimum-rating-count rule for "top rated" lists.
export function qualifiedMovies(ratings: Rating[]): MovieStats[] {
  return movieStats(ratings).filter((s) => s.count >= MIN_RATINGS_FOR_TOP);
}

export function topRatedMovies(ratings: Rating[], limit = 5): MovieStats[] {
  return qualifiedMovies(ratings)
    .sort((a, b) => b.average - a.average || b.count - a.count)
    .slice(0, limit);
}

export function overallAverage(ratings: Rating[]): number {
  if (ratings.length === 0) return 0;
  return ratings.reduce((s, r) => s + r.rating, 0) / ratings.length;
}

export function topMovie(ratings: Rating[]): MovieStats | null {
  const top = topRatedMovies(ratings, 1);
  return top.length > 0 ? top[0] : null;
}

export interface GenreStat {
  genre: Genre;
  average: number;
  count: number;
}

export function genreStats(ratings: Rating[]): GenreStat[] {
  const stats: GenreStat[] = [];
  for (const movie of MOVIES) {
    const rs = ratingsForMovie(ratings, movie.movie_id);
    let entry = stats.find((s) => s.genre === movie.genre);
    if (!entry) {
      entry = { genre: movie.genre, average: 0, count: 0 };
      stats.push(entry);
    }
    // accumulate via temp sums handled below
    entry.count += rs.length;
  }
  // proper average computed from raw ratings
  for (const entry of stats) {
    const genreRatings = ratings.filter((r) => {
      const m = getMovieById(r.movie_id);
      return m?.genre === entry.genre;
    });
    entry.average =
      genreRatings.length === 0
        ? 0
        : genreRatings.reduce((s, r) => s + r.rating, 0) / genreRatings.length;
  }
  return stats.sort((a, b) => b.average - a.average);
}

// Rating distribution: how many ratings fall at each star value 1..5
export function ratingDistribution(ratings: Rating[]): number[] {
  const dist = [0, 0, 0, 0, 0]; // index 0 => 1 star
  for (const r of ratings) {
    if (r.rating >= 1 && r.rating <= 5) dist[r.rating - 1]++;
  }
  return dist;
}

// Popularity-based recommendations: high average + meets min count rule.
export function popularityRecommendations(ratings: Rating[], limit = 6): MovieStats[] {
  return qualifiedMovies(ratings)
    .sort(
      (a, b) =>
        b.average - a.average || b.count - a.count || b.movie.release_year - a.movie.release_year
    )
    .slice(0, limit);
}

// Similar titles share the same language (preferred) or genre, excluding the
// given title. Same-language matches rank ahead of same-genre-only matches.
export function similarMovies(movie: Movie, ratings: Rating[], limit = 4): MovieStats[] {
  const scored = movieStats(ratings)
    .filter((s) => s.movie.movie_id !== movie.movie_id)
    .map((s) => ({
      stat: s,
      score:
        (s.movie.language === movie.language ? 2 : 0) +
        (s.movie.genre === movie.genre ? 1 : 0),
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || b.stat.average - a.stat.average || b.stat.count - a.stat.count)
    .slice(0, limit);
  return scored.map((x) => x.stat);
}
