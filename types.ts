export type Genre =
  | 'Action'
  | 'Sci-Fi'
  | 'Drama'
  | 'Comedy'
  | 'Romance'
  | 'Thriller'
  | 'Animation';

export type Language =
  | 'Telugu'
  | 'Hindi'
  | 'Tamil'
  | 'Malayalam'
  | 'English'
  | 'Korean'
  | 'Chinese';

export type Category = 'Movie' | 'Drama';

export interface Movie {
  movie_id: number;
  title: string;
  release_year: number;
  genre: Genre;
  language: Language;
  category: Category;
  poster: string; // gradient class string (fallback)
  posterUrl?: string; // official poster URL
  overview?: string;
  release_date?: string;
  tmdb_id?: number;
}

export interface User {
  user_id: number;
  display_name: string;
}

export interface Rating {
  rating_id: number;
  user_id: number;
  movie_id: number;
  rating: number; // 1..5
  rated_at: string; // ISO date
}

export interface MovieStats {
  movie: Movie;
  average: number;
  count: number;
}
