import axios from 'axios';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

const tmdbClient = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY,
  },
});

export const getTrendingMovies = async () => {
  if (!API_KEY) return { results: [] };
  const response = await tmdbClient.get('/trending/movie/day');
  return response.data;
};

export const getUpcomingMovies = async () => {
  if (!API_KEY) return { results: [] };
  const response = await tmdbClient.get('/movie/upcoming');
  return response.data;
};

export const getMovieDetails = async (id) => {
  if (!API_KEY) return null;
  const response = await tmdbClient.get(`/movie/${id}`);
  return response.data;
};

export const getMovieImages = async (id) => {
  if (!API_KEY) return null;
  const response = await tmdbClient.get(`/movie/${id}/images`);
  return response.data;
};
