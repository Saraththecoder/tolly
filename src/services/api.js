import axios from 'axios';

export const getArticles = async ({ page = 1, limit = 10, category = null, search = '' }) => {
  const response = await axios.get('/api/articles', {
    params: { category, search }
  });
  const posts = response.data.data || [];
  const total = response.data.total || posts.length;
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginated = posts.slice(start, end);
  
  return {
    data: paginated,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

export const getArticleBySlug = async (slug) => {
  const response = await axios.get(`/api/articles/${slug}`);
  return response.data;
};

export const getArticlesByLetter = async (letter) => {
  const response = await axios.get('/api/articles');
  const posts = response.data.data || [];
  return posts.filter(a => a.title.toLowerCase().startsWith(letter.toLowerCase()));
};

export const getReviews = async () => {
  const response = await axios.get('/api/reviews');
  return response.data || [];
};

export const getReviewBySlug = async (slug) => {
  const response = await axios.get(`/api/reviews/${slug}`);
  return response.data;
};

export const getBoxOffice = async () => {
  const response = await axios.get('/api/box-office');
  return response.data || [];
};

export const getBoxOfficeBySlug = async (slug) => {
  const response = await axios.get(`/api/box-office/${slug}`);
  return response.data;
};

export const getGalleries = async () => {
  const response = await axios.get('/api/galleries');
  return response.data || [];
};

// --- New dynamic API endpoints ---

export const getPopupAd = async () => {
  const response = await axios.get('/api/popup-ad');
  return response.data || { active: false };
};

export const getUpcomingSchedules = async () => {
  const response = await axios.get('/api/schedules');
  return response.data || [];
};

export const getNorthAmericaCollections = async () => {
  const response = await axios.get('/api/north-america');
  return response.data || [];
};

export const getBoxOfficeTop5 = async () => {
  const response = await axios.get('/api/box-office-top5');
  return response.data || [];
};



