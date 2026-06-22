import { getDb } from '../utils/db';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getArticles = async ({ page = 1, limit = 10, category = null, search = '' }) => {
  await delay(200); // Simulate network latency (reduced for snappier transitions)
  
  const db = getDb();
  let filtered = db.articles || [];
  
  if (category) {
    filtered = filtered.filter(a => a.category.toLowerCase() === category.toLowerCase());
  }
  
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(a => 
      a.title.toLowerCase().includes(s) || a.excerpt.toLowerCase().includes(s)
    );
  }
  
  // Sort by date descending
  filtered = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  const total = filtered.length;
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginated = filtered.slice(start, end);
  
  return {
    data: paginated,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

export const getArticleBySlug = async (slug) => {
  await delay(100);
  const db = getDb();
  const article = (db.articles || []).find(a => a.slug === slug);
  if (!article) throw new Error('Article not found');
  return article;
};

export const getArticlesByLetter = async (letter) => {
  await delay(200);
  const db = getDb();
  const filtered = (db.articles || []).filter(a => a.title.toLowerCase().startsWith(letter.toLowerCase()));
  return filtered;
};

export const getReviews = async () => {
  await delay(200);
  return getDb().reviews || [];
};

export const getReviewBySlug = async (slug) => {
  await delay(100);
  const db = getDb();
  const review = (db.reviews || []).find(r => r.slug === slug);
  if (!review) throw new Error('Review not found');
  return review;
};

export const getBoxOffice = async () => {
  await delay(200);
  return getDb().boxOffice || [];
};

export const getBoxOfficeBySlug = async (slug) => {
  await delay(100);
  const db = getDb();
  const bo = (db.boxOffice || []).find(b => b.slug === slug);
  if (!bo) throw new Error('Box office entry not found');
  return bo;
};

export const getGalleries = async () => {
  await delay(200);
  return getDb().galleries || [];
};

// --- New dynamic API endpoints ---

export const getPopupAd = async () => {
  await delay(50);
  return getDb().popupAd || { active: false };
};

export const getUpcomingSchedules = async () => {
  await delay(150);
  return getDb().upcomingSchedules || [];
};

export const getNorthAmericaCollections = async () => {
  await delay(150);
  return getDb().northAmericaCollections || [];
};

export const getBoxOfficeTop5 = async () => {
  await delay(100);
  return getDb().boxOfficeTop5 || [];
};


