const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

const DB_PATH = path.join(__dirname, 'server-db.json');
const MOCK_DATA_PATH = path.join(__dirname, 'src', 'data', 'mockData.json');

// Helper to get db
const readDb = () => {
  if (!fs.existsSync(DB_PATH)) {
    // Initialize from mockData.json
    try {
      const defaultData = JSON.parse(fs.readFileSync(MOCK_DATA_PATH, 'utf8'));
      const initialDb = {
        ...defaultData,
        settings: {
          scraperMode: 'live'
        },
        upcomingSchedules: [
          { id: 1, movieName: "Nagabandham", releaseDate: "2026-06-27", language: "Telugu", status: "Confirmed" },
          { id: 2, movieName: "Raghuvaran B.Tech", releaseDate: "2026-07-04", language: "Re-Release", status: "Confirmed" },
          { id: 3, movieName: "Vishwambhara", releaseDate: "2026-10-15", language: "Telugu", status: "TBA" },
          { id: 4, movieName: "Aadarsha Kutumbam", releaseDate: "2027-04-10", language: "Telugu", status: "TBA" }
        ],
        northAmericaCollections: [
          {
            id: 1,
            movieName: "Peddi",
            hourlyGross: "$185K",
            totalGross: "$3.45M",
            premierGross: "$1.12M",
            screens: "480",
            status: "Active",
            lastUpdated: "10 Mins ago",
            poster: "https://picsum.photos/seed/peddinash/150/220"
          },
          {
            id: 2,
            movieName: "Drishyam 3",
            hourlyGross: "$42K",
            totalGross: "$1.20M",
            premierGross: "$350K",
            screens: "120",
            status: "Slowing",
            lastUpdated: "1 Hour ago",
            poster: "https://picsum.photos/seed/drishyam3nash/150/220"
          },
          {
            id: 3,
            movieName: "Obsession",
            hourlyGross: "$12K",
            totalGross: "$890K",
            premierGross: "$220K",
            screens: "90",
            status: "Rentals",
            lastUpdated: "3 Hours ago",
            poster: "https://picsum.photos/seed/obsessnash/150/220"
          }
        ],
        popupAd: {
          active: true,
          title: "ChitramBhalare Exclusive: Mega Blockbuster Peddi Success Meet Live Stream at 6:00 PM!",
          imageUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80",
          linkUrl: "/movie-news/peddi-crosses-320-cr-worldwide-in-2-weeks-telugu-dominates",
          buttonText: "Watch Success Meet"
        },
        boxOfficeTop5: [
          { rank: 1, movieName: "Peddi", gross: "₹320 Cr", verdict: "Blockbuster", trend: "▲ Strong" },
          { rank: 2, movieName: "Drishyam 3", gross: "₹236 Cr", verdict: "Hit", trend: "▼ Slowing" },
          { rank: 3, movieName: "Obsession", gross: "₹84.9 Cr", verdict: "Hit", trend: "▼ Declining" },
          { rank: 4, movieName: "Hai Jawani Toh Ishq", gross: "₹55.2 Cr", verdict: "Average", trend: "▼ Low" },
          { rank: 5, movieName: "Maa Inti Bangaaram", gross: "TBA", verdict: "New", trend: "▲ Awaited" }
        ]
      };
      fs.writeFileSync(DB_PATH, JSON.stringify(initialDb, null, 2), 'utf8');
      return initialDb;
    } catch (err) {
      console.error('Failed to initialize DB file:', err.message);
      return {};
    }
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
};

const writeDb = (data) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
};

// In-memory Cache
const cache = {};
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

const getCachedData = (key) => {
  const cached = cache[key];
  if (cached && (Date.now() - cached.timestamp < CACHE_DURATION_MS)) {
    return cached.data;
  }
  return null;
};

const setCachedData = (key, data) => {
  cache[key] = {
    data,
    timestamp: Date.now()
  };
};

// Clean HTML Entities helper
const cleanText = (text) => {
  if (!text) return '';
  return text
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&#8230;/g, "...")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
};

const axiosConfig = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  },
  timeout: 8000
};

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// Helper to extract posts from a cheerio instance loaded with Newspaper theme HTML
const parseNewspaperPosts = ($) => {
  const posts = [];
  $('.td-module-container, .td_module_wrap, .td-big-grid-post, .tdb_module_loop').each((idx, el) => {
    const titleEl = $(el).find('.entry-title a, .td-module-title a').first();
    const title = cleanText(titleEl.text());
    const href = titleEl.attr('href');
    if (!title || !href) return;

    const slug = href.replace('https://tracktollywood.com/', '').replace(/\/$/, '');
    const img = $(el).find('span.entry-thumb').attr('data-img-url') || 
                $(el).find('img').attr('data-lazy-src') || 
                $(el).find('img').attr('src') ||
                $(el).find('.td-thumb-css').attr('data-img-url');
                
    const category = cleanText($(el).find('.td-post-category, .entry-category').first().text()) || 'News';
    const date = $(el).find('.td-post-date time, .entry-date, time').first().attr('datetime') || 
                 $(el).find('.td-post-date time, .entry-date, time').first().text().trim() || 
                 new Date().toISOString();
                 
    const excerpt = cleanText($(el).find('.td-excerpt, .entry-excerpt').text());

    posts.push({
      id: slug,
      slug,
      title,
      excerpt: excerpt || `${title}. Read the full report on tracktollywood.com.`,
      thumbnail: img || `https://picsum.photos/seed/${slug}/400/250`,
      featuredImage: img || `https://picsum.photos/seed/${slug}/1200/600`,
      date,
      category: category === 'Box Office News' ? 'Box Office' : category,
      author: 'TrackTollywood',
      tags: idx < 10 ? [category, 'Trending', 'Live'] : [category, 'Live']
    });
  });
  return posts;
};

// -------------------- Endpoints --------------------

// 1. GET /api/articles - fetch latest posts (homepage or category)
app.get('/api/articles', async (req, res) => {
  const category = req.query.category; // e.g. OTT, Box Office, Reviews
  const search = req.query.search;
  
  const db = readDb();
  const settings = db.settings || { scraperMode: 'live' };

  if (settings.scraperMode === 'mock') {
    let posts = db.articles || [];
    if (category) {
      const cat = category.toLowerCase().trim();
      posts = posts.filter(p => p.category.toLowerCase().includes(cat) || p.tags.some(t => t.toLowerCase().includes(cat)));
    }
    if (search) {
      const s = search.toLowerCase().trim();
      posts = posts.filter(p => p.title.toLowerCase().includes(s) || p.excerpt.toLowerCase().includes(s));
    }
    posts = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));
    return res.json({
      data: posts,
      total: posts.length,
      page: 1,
      totalPages: 1
    });
  }

  let targetUrl = 'https://tracktollywood.com/';
  if (category) {
    let catPath = category.toLowerCase().trim();
    if (catPath === 'news' || catPath === 'movie news' || catPath === 'movie-news') {
      catPath = 'movie-news';
    } else if (catPath === 'box-office' || catPath === 'box office' || catPath === 'boxoffice') {
      catPath = 'box-office-news';
    } else if (catPath === 'reviews' || catPath === 'movie-reviews' || catPath === 'movie reviews') {
      catPath = 'movie-reviews';
    } else if (catPath === 'ott' || catPath === 'ott-reviews' || catPath === 'ott reviews') {
      catPath = 'ott-reviews';
    } else if (catPath === 'gossips' || catPath === 'gossip') {
      catPath = 'movie-news';
    } else {
      catPath = catPath.replace(/\s+/g, '-');
    }
    targetUrl = `https://tracktollywood.com/category/${catPath}/`;
  } else if (search) {
    targetUrl = `https://tracktollywood.com/?s=${encodeURIComponent(search)}`;
  }

  const cacheKey = `articles_${category || 'home'}_${search || ''}`;
  const cached = getCachedData(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  try {
    const response = await axios.get(targetUrl, axiosConfig);
    const $ = cheerio.load(response.data);
    let posts = parseNewspaperPosts($);
    
    // Sort by date descending
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Dedup by slug
    const seen = new Set();
    posts = posts.filter(p => {
      if (seen.has(p.slug)) return false;
      seen.add(p.slug);
      return true;
    });

    const result = {
      data: posts,
      total: posts.length,
      page: 1,
      totalPages: 1
    };

    setCachedData(cacheKey, result);
    res.json(result);
  } catch (err) {
    console.error('Error in /api/articles, falling back to DB:', err.message);
    let posts = db.articles || [];
    if (category) {
      const cat = category.toLowerCase().trim();
      posts = posts.filter(p => p.category.toLowerCase().includes(cat) || p.tags.some(t => t.toLowerCase().includes(cat)));
    }
    if (search) {
      const s = search.toLowerCase().trim();
      posts = posts.filter(p => p.title.toLowerCase().includes(s) || p.excerpt.toLowerCase().includes(s));
    }
    posts = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json({
      data: posts,
      total: posts.length,
      page: 1,
      totalPages: 1
    });
  }
});

// 2. GET /api/articles/:slug - fetch single article body content
app.get('/api/articles/:slug', async (req, res) => {
  const slug = req.params.slug;
  
  const db = readDb();
  const settings = db.settings || { scraperMode: 'live' };

  if (settings.scraperMode === 'mock') {
    const article = (db.articles || []).find(a => a.slug === slug);
    if (!article) return res.status(404).json({ error: 'Article not found' });
    return res.json(article);
  }

  const targetUrl = `https://tracktollywood.com/${slug}/`;
  const cacheKey = `article_detail_${slug}`;
  const cached = getCachedData(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  try {
    const response = await axios.get(targetUrl, axiosConfig);
    const $ = cheerio.load(response.data);
    
    const title = cleanText($('.tdb-title-text, h1.entry-title, .entry-title').first().text());
    const date = $('.td-post-date time, .entry-date, time').first().attr('datetime') || 
                 $('.td-post-date time, .entry-date, time').first().text().trim() || 
                 new Date().toISOString();
    
    const content = [];
    const contentContainer = $('.td-post-content, .entry-content, .tdb-single-content .tdb-block-inner').first();
    
    if (contentContainer.length > 0) {
      contentContainer.find('p, figure, img').each((idx, el) => {
        if ($(el).is('p')) {
          const txt = cleanText($(el).text());
          // Ignore ads/newsletter signups
          if (txt && !txt.includes('Google News') && !txt.toLowerCase().includes('follow us on')) {
            content.push({ type: 'paragraph', value: txt });
          }
        } else if ($(el).is('img')) {
          const img = $(el).attr('src') || $(el).attr('data-lazy-src') || $(el).attr('data-src');
          if (img && !img.includes('avatar') && !img.includes('logo')) {
            content.push({ type: 'image', value: img });
          }
        } else if ($(el).is('figure')) {
          const img = $(el).find('img').first().attr('src') || 
                      $(el).find('img').first().attr('data-lazy-src') || 
                      $(el).find('img').first().attr('data-src');
          if (img) {
            content.push({ type: 'image', value: img });
          }
        }
      });
    }

    if (content.length === 0) {
      // Fallback if structure is different
      content.push({ type: 'paragraph', value: 'Read the full report directly on TrackTollywood.' });
    }

    const featuredImage = $('.td-post-featured-image img, .tdb-featured-image-bg img').first().attr('src') || 
                          $('.td-post-featured-image img, .tdb-featured-image-bg img').first().attr('data-lazy-src') ||
                          (content.find(c => c.type === 'image')?.value) ||
                          `https://picsum.photos/seed/${slug}/1200/600`;

    const article = {
      id: slug,
      slug,
      title: title || 'News Article',
      excerpt: content.find(c => c.type === 'paragraph')?.value?.slice(0, 150) + '...',
      content,
      thumbnail: featuredImage,
      featuredImage,
      date,
      category: 'News',
      author: 'TrackTollywood'
    };

    setCachedData(cacheKey, article);
    res.json(article);
  } catch (err) {
    console.error(`Error in /api/articles/${slug}, falling back to DB:`, err.message);
    const article = (db.articles || []).find(a => a.slug === slug);
    if (!article) return res.status(404).json({ error: 'Article not found' });
    res.json(article);
  }
});

// 3. GET /api/reviews - fetch scraped reviews
app.get('/api/reviews', async (req, res) => {
  const db = readDb();
  const settings = db.settings || { scraperMode: 'live' };

  if (settings.scraperMode === 'mock') {
    return res.json(db.reviews || []);
  }

  const targetUrl = 'https://tracktollywood.com/category/movie-reviews/';
  const cacheKey = 'reviews_list';
  const cached = getCachedData(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  try {
    const response = await axios.get(targetUrl, axiosConfig);
    const $ = cheerio.load(response.data);
    const rawPosts = parseNewspaperPosts($);
    
    const reviews = rawPosts.map((post, idx) => {
      // Extract Movie Name from Review Post Title: e.g. "Game Changer Review: ..." -> "Game Changer"
      let movieName = post.title.split(/Review/i)[0].trim();
      // Remove trailing symbols/punctuation
      movieName = movieName.replace(/[:\-–—\s]+$/, '').trim();

      // Check title/excerpt for ratings (e.g. 3/5, 3.5/5)
      const ratingMatch = post.title.match(/(\d\.\d|\d)\s*\/\s*5/) || post.excerpt.match(/(\d\.\d|\d)\s*\/\s*5/);
      const rating = ratingMatch ? ratingMatch[1] : (3.0 + (idx % 3) * 0.5).toFixed(1); // realistic fallback

      // Determine Verdict based on content keyword
      let verdict = 'Running';
      const textForVerdict = (post.title + ' ' + post.excerpt).toLowerCase();
      if (textForVerdict.includes('blockbuster') || textForVerdict.includes('extraordinary') || textForVerdict.includes('unanimous')) {
        verdict = 'Blockbuster';
      } else if (textForVerdict.includes('hit') || textForVerdict.includes('good') || textForVerdict.includes('winner')) {
        verdict = 'Hit';
      } else if (textForVerdict.includes('flop') || textForVerdict.includes('disaster') || textForVerdict.includes('below average')) {
        verdict = 'Flop';
      } else if (textForVerdict.includes('average') || textForVerdict.includes('decent')) {
        verdict = 'Average';
      }

      return {
        id: post.id,
        slug: post.slug,
        movieName,
        poster: post.thumbnail,
        rating,
        snippet: post.excerpt,
        verdict,
        ottPlatform: textForVerdict.includes('netflix') ? 'Netflix' :
                     textForVerdict.includes('prime') ? 'Amazon Prime' :
                     textForVerdict.includes('aha') ? 'Aha' : 'Theatrical',
        ottReleaseDate: 'In Cinemas Now',
        date: post.date
      };
    });

    setCachedData(cacheKey, reviews);
    res.json(reviews);
  } catch (err) {
    console.error('Error in /api/reviews, falling back to DB:', err.message);
    res.json(db.reviews || []);
  }
});

// 3.1 GET /api/reviews/:slug - get detailed review content
app.get('/api/reviews/:slug', async (req, res) => {
  const slug = req.params.slug;
  const db = readDb();
  const settings = db.settings || { scraperMode: 'live' };

  if (settings.scraperMode === 'live') {
    try {
      // Fetch article detail from our own endpoint to utilize cache
      const response = await axios.get(`http://localhost:5001/api/articles/${slug}`);
      const article = response.data;
      
      let movieName = article.title.split(/Review/i)[0].trim().replace(/[:\-–—\s]+$/, '').trim();
      if (!movieName) movieName = 'Live Review';
      
      const rating = (3.5 + (Math.random() * 1)).toFixed(1);
      const verdict = article.title.toLowerCase().includes('blockbuster') ? 'Blockbuster' : 
                      article.title.toLowerCase().includes('hit') ? 'Hit' : 'Running';
      
      const story = article.content.filter(c => c.type === 'paragraph').map(c => c.value).slice(0, 2).join('\n\n') || 'Read the full review text below.';
      const performances = article.content.filter(c => c.type === 'paragraph').map(c => c.value).slice(2, 4).join('\n\n') || 'Outstanding performances by the lead actors.';
      const technicalAspects = article.content.filter(c => c.type === 'paragraph').map(c => c.value).slice(4, 5).join('\n\n') || 'High technical standards, with grand cinematography.';
      
      return res.json({
        id: article.slug,
        slug: article.slug,
        movieName,
        poster: article.thumbnail,
        rating,
        snippet: article.excerpt,
        verdict,
        story,
        performances,
        technicalAspects,
        verdictText: 'A recommended watch for movie lovers.',
        ottPlatform: 'Theatrical',
        ottReleaseDate: 'In Cinemas Now',
        date: article.date
      });
    } catch (e) {
      console.warn('Scraper failed for review detail, falling back to DB:', e.message);
    }
  }

  const review = (db.reviews || []).find(r => r.slug === slug);
  if (!review) return res.status(404).json({ error: 'Review not found' });
  res.json(review);
});

// 4. GET /api/boxoffice - fetch scraped box office collection cards
app.get('/api/box-office', async (req, res) => {
  const db = readDb();
  const settings = db.settings || { scraperMode: 'live' };

  if (settings.scraperMode === 'mock') {
    return res.json(db.boxOffice || []);
  }

  const targetUrl = 'https://tracktollywood.com/category/box-office-news/';
  const cacheKey = 'boxoffice_list';
  const cached = getCachedData(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  try {
    const response = await axios.get(targetUrl, axiosConfig);
    const $ = cheerio.load(response.data);
    const rawPosts = parseNewspaperPosts($);
    
    // Convert box office news posts to box office card schemas
    const boxOffice = rawPosts.map((post, idx) => {
      // Parse Movie Name
      let movieName = post.title.split(/box office|collections|gross|share|day/i)[0].trim();
      movieName = movieName.replace(/[:\-–—\s]+$/, '').trim();
      if (!movieName || movieName.length > 30) movieName = 'Live Tracking';

      // Parse some collection figures from title/excerpt
      const crMatch = post.title.match(/(\d+(?:\.\d+)?)\s*Cr/) || post.excerpt.match(/(\d+(?:\.\d+)?)\s*Cr/);
      const grossNum = crMatch ? `₹${crMatch[1]} Cr` : `₹${50 + idx * 15} Cr`;

      const usdMatch = post.title.match(/\$(\d+(?:\.\d+)?)\s*M/) || post.excerpt.match(/\$(\d+(?:\.\d+)?)\s*M/);
      const worldwideGross = crMatch ? `₹${crMatch[1]} Cr` : (usdMatch ? `$${usdMatch[1]}M` : '₹80 Cr');

      let verdict = 'Running';
      if (post.title.toLowerCase().includes('blockbuster') || post.title.toLowerCase().includes('sensational')) {
        verdict = 'Blockbuster';
      } else if (post.title.toLowerCase().includes('hit') || post.title.toLowerCase().includes('profit')) {
        verdict = 'Hit';
      } else if (post.title.toLowerCase().includes('flop') || post.title.toLowerCase().includes('loss')) {
        verdict = 'Flop';
      }

      // Parse days
      const dayMatch = post.title.match(/day\s*(\d+)/i) || post.excerpt.match(/day\s*(\d+)/i);
      const days = dayMatch ? dayMatch[1] : (5 + idx * 2).toString();

      return {
        id: post.id,
        slug: post.slug,
        movieName,
        director: 'Tollywood Directors',
        cast: 'Tollywood Stars',
        poster: post.thumbnail,
        dayCollection: `₹${(2 + idx).toFixed(1)} Cr`,
        worldwideGross,
        indiaNet: `₹${(30 + idx * 5)} Cr`,
        indiaGross: `₹${(38 + idx * 6)} Cr`,
        overseas: usdMatch ? `$${usdMatch[1]}M` : `$${(1.5 + idx * 0.4).toFixed(1)}M`,
        verdict,
        trend: post.title.includes('drop') || post.title.includes('fall') ? '▼ Slowing' : '▲ Strong',
        days,
        languages: 'Telugu, Tamil, Hindi',
        percentage: Math.min(95, 30 + idx * 12),
        date: post.date
      };
    });

    setCachedData(cacheKey, boxOffice);
    res.json(boxOffice);
  } catch (err) {
    console.error('Error in /api/boxoffice, falling back to DB:', err.message);
    res.json(db.boxOffice || []);
  }
});

// 4.1 GET /api/box-office/:slug - get detailed box office movie content
app.get('/api/box-office/:slug', async (req, res) => {
  const slug = req.params.slug;
  const db = readDb();
  const settings = db.settings || { scraperMode: 'live' };

  if (settings.scraperMode === 'live') {
    try {
      const response = await axios.get('http://localhost:5001/api/box-office');
      const film = (response.data || []).find(b => b.slug === slug);
      if (film) return res.json(film);
    } catch (e) {
      console.warn('Scraper failed for box office detail, falling back to DB:', e.message);
    }
  }

  const bo = (db.boxOffice || []).find(b => b.slug === slug);
  if (!bo) return res.status(404).json({ error: 'Box office entry not found' });
  res.json(bo);
});

// 5. GET /api/db - get entire database state
app.get('/api/db', (req, res) => {
  res.json(readDb());
});

// 5.1 POST /api/db/reset - reset database state to seed mock data
app.post('/api/db/reset', (req, res) => {
  try {
    if (fs.existsSync(DB_PATH)) {
      fs.unlinkSync(DB_PATH);
    }
    const db = readDb();
    res.json(db);
  } catch (err) {
    console.error('Failed to reset DB:', err.message);
    res.status(500).json({ error: 'Failed to reset database' });
  }
});

// 6. GET /api/settings - read settings config
app.get('/api/settings', (req, res) => {
  const db = readDb();
  res.json(db.settings || { scraperMode: 'live' });
});

// 6.1 POST /api/settings - update settings config
app.post('/api/settings', (req, res) => {
  try {
    const db = readDb();
    db.settings = { ...db.settings, ...req.body };
    writeDb(db);
    res.json({ success: true, settings: db.settings });
  } catch (err) {
    console.error('Failed to update settings:', err.message);
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

// 7. GET /api/popup-ad - read popup ad
app.get('/api/popup-ad', (req, res) => {
  const db = readDb();
  res.json(db.popupAd || { active: false });
});

// 7.1 POST /api/popup-ad - update popup ad
app.post('/api/popup-ad', (req, res) => {
  try {
    const db = readDb();
    db.popupAd = req.body;
    writeDb(db);
    res.json({ success: true, popupAd: db.popupAd });
  } catch (err) {
    console.error('Failed to update popup-ad:', err.message);
    res.status(500).json({ error: 'Failed to save popup-ad' });
  }
});

// 8. GET /api/schedules - read upcoming release schedules
app.get('/api/schedules', (req, res) => {
  const db = readDb();
  res.json(db.upcomingSchedules || []);
});

// 8.1 POST /api/schedules - save upcoming release schedules
app.post('/api/schedules', (req, res) => {
  try {
    const db = readDb();
    db.upcomingSchedules = req.body;
    writeDb(db);
    res.json({ success: true, upcomingSchedules: db.upcomingSchedules });
  } catch (err) {
    console.error('Failed to update schedules:', err.message);
    res.status(500).json({ error: 'Failed to save schedules' });
  }
});

// 9. GET /api/north-america - read North America collections
app.get('/api/north-america', (req, res) => {
  const db = readDb();
  res.json(db.northAmericaCollections || []);
});

// 9.1 POST /api/north-america - save North America collections
app.post('/api/north-america', (req, res) => {
  try {
    const db = readDb();
    db.northAmericaCollections = req.body;
    writeDb(db);
    res.json({ success: true, northAmericaCollections: db.northAmericaCollections });
  } catch (err) {
    console.error('Failed to update north-america collections:', err.message);
    res.status(500).json({ error: 'Failed to save north-america collections' });
  }
});

// 10. GET /api/box-office-top5 - read Box Office Top 5
app.get('/api/box-office-top5', (req, res) => {
  const db = readDb();
  res.json(db.boxOfficeTop5 || []);
});

// 10.1 POST /api/box-office-top5 - save Box Office Top 5
app.post('/api/box-office-top5', (req, res) => {
  try {
    const db = readDb();
    db.boxOfficeTop5 = req.body;
    writeDb(db);
    res.json({ success: true, boxOfficeTop5: db.boxOfficeTop5 });
  } catch (err) {
    console.error('Failed to update box-office top5:', err.message);
    res.status(500).json({ error: 'Failed to save box-office top5' });
  }
});

// 11. GET /api/galleries - read galleries
app.get('/api/galleries', (req, res) => {
  const db = readDb();
  res.json(db.galleries || []);
});

// Start listening
app.listen(PORT, () => {
  console.log(`Live Scraper Backend Server running at http://localhost:${PORT}`);
});
