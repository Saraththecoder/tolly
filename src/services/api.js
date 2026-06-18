import mockData from '../data/mockData.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getArticles = async ({ page = 1, limit = 10, category = null, search = '' }) => {
  await delay(500); // Simulate network latency
  
  let filtered = mockData.articles;
  
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
  filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  
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
  await delay(300);
  const article = mockData.articles.find(a => a.slug === slug);
  if (!article) throw new Error('Article not found');
  return article;
};

export const getArticlesByLetter = async (letter) => {
  await delay(500);
  const filtered = mockData.articles.filter(a => a.title.toLowerCase().startsWith(letter.toLowerCase()));
  return filtered;
};

export const getReviews = async () => {
  await delay(500);
  return mockData.reviews;
};

export const getReviewBySlug = async (slug) => {
  await delay(300);
  const review = mockData.reviews.find(r => r.slug === slug);
  if (!review) throw new Error('Review not found');
  return review;
};

export const getBoxOffice = async () => {
  await delay(500);
  return mockData.boxOffice;
};

export const getBoxOfficeBySlug = async (slug) => {
  await delay(300);
  const bo = mockData.boxOffice.find(b => b.slug === slug);
  if (!bo) throw new Error('Box office entry not found');
  return bo;
};

export const getGalleries = async () => {
  await delay(500);
  return mockData.galleries || [];
};

