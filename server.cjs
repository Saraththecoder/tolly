const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const bcrypt = require('bcryptjs');

// Load environment variables
require('dotenv').config();
const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || 'admin123';
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Global middleware to replace Picsum placeholder images with reliable, curated Unsplash cinematic images
app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function (body) {
    const deepReplace = (obj) => {
      if (!obj) return obj;
      if (typeof obj === 'string') {
        if (obj.includes('picsum.photos')) {
          const seed = obj.split('/seed/')[1]?.split('/')[0] || 'movie';
          const unsplashIds = {
            'vishwambhara': '1536440136628-849c177e76a1',
            'dhurandhar': '1517604931442-7e0c8ed2963c',
            'preity': '1496345875659-11f7dd282d1d',
            'kannappa': '1509281373149-e957c6296406',
            'aadarsha': '1489599849927-2ee91cede3ba',
            'sunkara': '1485846234645-a62644f84728',
            'raghuvaran': '1598899134739-24c46f58b8c0',
            'drishyam': '1524712245354-2c4e5e7124c5',
            'multistarrer': '1574267432553-4b4628081c31',
            'vishwambhara2': '1536440136628-849c177e76a1',
            'jailer': '1507679799987-c73779587ccf',
            'nagabandham': '1478720568477-152d9b164e26',
            'peddi': '1508847154043-be12a62861c1',
            'gal1': '1524712245354-2c4e5e7124c5',
            'gal2': '1509281373149-e957c6296406',
            'gal3': '1496345875659-11f7dd282d1d',
            'gal4': '1485846234645-a62644f84728',
          };
          const matchedId = Object.keys(unsplashIds).find(key => seed.includes(key));
          const unsplashId = matchedId ? unsplashIds[matchedId] : '1489599849927-2ee91cede3ba';
          
          if (obj.includes('1200/600') || obj.includes('_feat')) {
            return `https://images.unsplash.com/photo-${unsplashId}?auto=format&fit=crop&w=1200&h=600&q=80`;
          }
          return `https://images.unsplash.com/photo-${unsplashId}?auto=format&fit=crop&w=600&h=400&q=80`;
        }
        return obj;
      }
      if (Array.isArray(obj)) {
        return obj.map(deepReplace);
      }
      if (typeof obj === 'object') {
        const newObj = {};
        for (const key in obj) {
          newObj[key] = deepReplace(obj[key]);
        }
        return newObj;
      }
      return obj;
    };
    
    const replacedBody = deepReplace(body);
    return originalJson.call(this, replacedBody);
  };
  next();
});

const requireAdminPasscode = async (req, res, next) => {
  const code = req.headers['x-admin-passcode'];
  if (!code) {
    return res.status(401).json({ error: 'Unauthorized: Missing admin passcode' });
  }

  let hash = null;
  if (pool) {
    try {
      const result = await pool.query('SELECT admin_password FROM settings ORDER BY id DESC LIMIT 1');
      if (result.rows.length > 0) {
        hash = result.rows[0].admin_password;
      }
    } catch (e) {
      console.error('Failed to read admin password from PG:', e.message);
    }
  }

  if (!hash) {
    try {
      const db = readDb();
      hash = db.settings?.adminPassword;
    } catch (e) {
      console.error('Failed to read admin password from JSON:', e.message);
    }
  }

  if (!hash) {
    const fallbackPass = process.env.ADMIN_PASSCODE || 'rajesh5678';
    hash = bcrypt.hashSync(fallbackPass, 10);
  }

  try {
    const match = await bcrypt.compare(code, hash);
    if (match) {
      next();
    } else {
      res.status(401).json({ error: 'Unauthorized: Invalid admin passcode' });
    }
  } catch (err) {
    console.error('Bcrypt verification failed:', err.message);
    res.status(500).json({ error: 'Internal validation error' });
  }
};

const DB_PATH = path.join(__dirname, 'server-db.json');
const MOCK_DATA_PATH = path.join(__dirname, 'src', 'data', 'mockData.json');

// Initialize PostgreSQL Pool using connection string
const hasDbUrl = !!process.env.DATABASE_URL;
const pool = hasDbUrl ? new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
}) : null;

// Database Schema Migrations and Auto-Seeding logic
const initDb = async () => {
  if (!pool) {
    console.warn('PostgreSQL Pool is not initialized. Skipping schema setup.');
    return;
  }
  try {
    console.log('Running PostgreSQL Database migrations...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        scraper_mode TEXT DEFAULT 'live'
      );
      CREATE TABLE IF NOT EXISTS popup_ad (
        id SERIAL PRIMARY KEY,
        active BOOLEAN,
        title TEXT,
        image_url TEXT,
        link_url TEXT,
        button_text TEXT
      );
      CREATE TABLE IF NOT EXISTS schedules (
        id SERIAL PRIMARY KEY,
        movie_name TEXT,
        release_date TEXT,
        language TEXT,
        status TEXT
      );
      CREATE TABLE IF NOT EXISTS north_america (
        id SERIAL PRIMARY KEY,
        movie_name TEXT,
        hourly_gross TEXT,
        total_gross TEXT,
        premier_gross TEXT,
        screens TEXT,
        status TEXT,
        last_updated TEXT,
        poster TEXT
      );
      CREATE TABLE IF NOT EXISTS box_office_top5 (
        id SERIAL PRIMARY KEY,
        rank INTEGER,
        movie_name TEXT,
        gross TEXT,
        verdict TEXT,
        trend TEXT
      );
      CREATE TABLE IF NOT EXISTS articles (
        id TEXT PRIMARY KEY,
        slug TEXT UNIQUE,
        title TEXT,
        excerpt TEXT,
        content JSONB,
        thumbnail TEXT,
        featured_image TEXT,
        date TEXT,
        category TEXT,
        author TEXT,
        tags JSONB
      );
      CREATE TABLE IF NOT EXISTS reviews (
        id TEXT PRIMARY KEY,
        slug TEXT UNIQUE,
        movie_name TEXT,
        poster TEXT,
        rating TEXT,
        snippet TEXT,
        verdict TEXT,
        story TEXT,
        performances TEXT,
        technical_aspects TEXT,
        verdict_text TEXT,
        ott_platform TEXT,
        ott_release_date TEXT,
        date TEXT
      );
      CREATE TABLE IF NOT EXISTS box_office (
        id TEXT PRIMARY KEY,
        slug TEXT UNIQUE,
        movie_name TEXT,
        director TEXT,
        movie_cast TEXT,
        poster TEXT,
        day_collection TEXT,
        worldwide_gross TEXT,
        india_net TEXT,
        india_gross TEXT,
        overseas TEXT,
        verdict TEXT,
        trend TEXT,
        days TEXT,
        languages TEXT,
        percentage INTEGER,
        date TEXT,
        daily_breakdown JSONB,
        budget TEXT,
        total_india_net TEXT,
        us_premieres TEXT
      );
      CREATE TABLE IF NOT EXISTS galleries (
        id SERIAL PRIMARY KEY,
        title TEXT,
        cover_image TEXT,
        images JSONB,
        date TEXT
      );
    `);
    await pool.query('ALTER TABLE settings ADD COLUMN IF NOT EXISTS admin_password TEXT');
    console.log('PostgreSQL tables verified.');

    // Seeding Logic
    let defaultData = {};
    if (fs.existsSync(DB_PATH)) {
      try {
        defaultData = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
      } catch (e) {
        console.error('Error loading default data from server-db.json:', e.message);
      }
    }
    if ((!defaultData.articles || defaultData.articles.length === 0) && fs.existsSync(MOCK_DATA_PATH)) {
      try {
        defaultData = JSON.parse(fs.readFileSync(MOCK_DATA_PATH, 'utf8'));
      } catch (e) {
        console.error('Error loading default data from mockData.json:', e.message);
      }
    }

    // 1. Seed settings
    const settingsCheck = await pool.query('SELECT COUNT(*) FROM settings');
    if (parseInt(settingsCheck.rows[0].count) === 0) {
      const mode = (defaultData.settings && defaultData.settings.scraperMode) || 'live';
      const hash = bcrypt.hashSync('rajesh5678', 10);
      await pool.query('INSERT INTO settings (scraper_mode, admin_password) VALUES ($1, $2)', [mode, hash]);
    } else {
      const checkPass = await pool.query('SELECT admin_password FROM settings ORDER BY id DESC LIMIT 1');
      if (checkPass.rows.length > 0 && !checkPass.rows[0].admin_password) {
        const hash = bcrypt.hashSync('rajesh5678', 10);
        await pool.query('UPDATE settings SET admin_password = $1', [hash]);
      }
    }

    // 2. Seed popup_ad
    const popupCheck = await pool.query('SELECT COUNT(*) FROM popup_ad');
    if (parseInt(popupCheck.rows[0].count) === 0 && defaultData.popupAd) {
      const ad = defaultData.popupAd;
      await pool.query(
        'INSERT INTO popup_ad (active, title, image_url, link_url, button_text) VALUES ($1, $2, $3, $4, $5)',
        [ad.active, ad.title, ad.imageUrl, ad.linkUrl, ad.buttonText]
      );
    }

    // 3. Seed schedules
    const schedCheck = await pool.query('SELECT COUNT(*) FROM schedules');
    if (parseInt(schedCheck.rows[0].count) === 0 && defaultData.upcomingSchedules) {
      for (const s of defaultData.upcomingSchedules) {
        await pool.query(
          'INSERT INTO schedules (movie_name, release_date, language, status) VALUES ($1, $2, $3, $4)',
          [s.movieName, s.releaseDate, s.language, s.status]
        );
      }
    }

    // 4. Seed north_america
    const naCheck = await pool.query('SELECT COUNT(*) FROM north_america');
    if (parseInt(naCheck.rows[0].count) === 0 && defaultData.northAmericaCollections) {
      for (const n of defaultData.northAmericaCollections) {
        await pool.query(
          'INSERT INTO north_america (movie_name, hourly_gross, total_gross, premier_gross, screens, status, last_updated, poster) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
          [n.movieName, n.hourlyGross, n.totalGross, n.premierGross, n.screens, n.status, n.lastUpdated, n.poster]
        );
      }
    }

    // 5. Seed box_office_top5
    const bo5Check = await pool.query('SELECT COUNT(*) FROM box_office_top5');
    if (parseInt(bo5Check.rows[0].count) === 0 && defaultData.boxOfficeTop5) {
      for (const b of defaultData.boxOfficeTop5) {
        await pool.query(
          'INSERT INTO box_office_top5 (rank, movie_name, gross, verdict, trend) VALUES ($1, $2, $3, $4, $5)',
          [b.rank, b.movieName, b.gross, b.verdict, b.trend]
        );
      }
    }

    // 6. Seed articles
    const artCheck = await pool.query('SELECT COUNT(*) FROM articles');
    if (parseInt(artCheck.rows[0].count) === 0 && defaultData.articles) {
      for (const a of defaultData.articles) {
        await pool.query(
          'INSERT INTO articles (id, slug, title, excerpt, content, thumbnail, featured_image, date, category, author, tags) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) ON CONFLICT DO NOTHING',
          [
            String(a.id || a.slug),
            a.slug,
            a.title,
            a.excerpt,
            JSON.stringify(a.content),
            a.thumbnail,
            a.featuredImage,
            a.date,
            a.category,
            a.author,
            JSON.stringify(a.tags)
          ]
        );
      }
    }

    // 7. Seed reviews
    const revCheck = await pool.query('SELECT COUNT(*) FROM reviews');
    if (parseInt(revCheck.rows[0].count) === 0 && defaultData.reviews) {
      for (const r of defaultData.reviews) {
        await pool.query(
          'INSERT INTO reviews (id, slug, movie_name, poster, rating, snippet, verdict, story, performances, technical_aspects, verdict_text, ott_platform, ott_release_date, date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) ON CONFLICT DO NOTHING',
          [
            String(r.id || r.slug),
            r.slug,
            r.movieName,
            r.poster,
            r.rating,
            r.snippet,
            r.verdict,
            r.story,
            r.performances,
            r.technicalAspects,
            r.verdictText,
            r.ottPlatform,
            r.ottReleaseDate,
            r.date
          ]
        );
      }
    }

    // 8. Seed box_office
    const boCheck = await pool.query('SELECT COUNT(*) FROM box_office');
    if (parseInt(boCheck.rows[0].count) === 0 && defaultData.boxOffice) {
      for (const b of defaultData.boxOffice) {
        await pool.query(
          'INSERT INTO box_office (id, slug, movie_name, director, movie_cast, poster, day_collection, worldwide_gross, india_net, india_gross, overseas, verdict, trend, days, languages, percentage, date, daily_breakdown, budget, total_india_net, us_premieres) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21) ON CONFLICT DO NOTHING',
          [
            String(b.id || b.slug),
            b.slug,
            b.movieName,
            b.director,
            b.cast,
            b.poster,
            b.dayCollection,
            b.worldwideGross,
            b.indiaNet,
            b.indiaGross,
            b.overseas,
            b.verdict,
            b.trend,
            b.days,
            b.languages,
            b.percentage,
            b.date,
            JSON.stringify(b.dailyBreakdown),
            b.budget,
            b.totalIndiaNet,
            b.usPremieres
          ]
        );
      }
    }

    // 9. Seed galleries
    const galCheck = await pool.query('SELECT COUNT(*) FROM galleries');
    if (parseInt(galCheck.rows[0].count) === 0 && defaultData.galleries) {
      for (const g of defaultData.galleries) {
        await pool.query(
          'INSERT INTO galleries (title, cover_image, images, date) VALUES ($1, $2, $3, $4)',
          [g.title, g.coverImage || g.image, JSON.stringify(g.images || []), g.date || new Date().toISOString()]
        );
      }
    }

    console.log('PostgreSQL database initialization & seeding successful.');
  } catch (err) {
    console.error('Failed to initialize database tables:', err.message);
  }
};

if (pool) {
  initDb();
} else {
  console.warn('DATABASE_URL environment variable is missing. SQL queries will fall back to local file JSON database.');
}

// Helper to get db
const readDb = () => {
  if (!fs.existsSync(DB_PATH)) {
    // Initialize from mockData.json
    try {
      const defaultData = JSON.parse(fs.readFileSync(MOCK_DATA_PATH, 'utf8'));
      const initialDb = {
        ...defaultData,
        settings: {
          scraperMode: 'live',
          adminPassword: bcrypt.hashSync('rajesh5678', 10)
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
  const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  if (db && db.settings && !db.settings.adminPassword) {
    db.settings.adminPassword = bcrypt.hashSync('rajesh5678', 10);
    writeDb(db);
  }
  return db;
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

// Helper to clean and resolve image URLs from cheerio elements
const resolveScrapedImageUrl = (el, $) => {
  if (!el || el.length === 0) return null;
  
  let imgUrl = null;
  
  const getUrl = (node) => {
    let url = node.attr('data-img-url') ||
              node.attr('data-orig-file') ||
              node.attr('data-large-file') ||
              node.attr('data-lazy-src') || 
              node.attr('data-src') || 
              node.attr('src');
              
    if (!url) {
      const style = node.attr('style');
      if (style) {
        const match = style.match(/url\s*\(\s*['"]?([^'")]+)['"]?\s*\)/i);
        if (match && match[1]) {
          url = match[1];
          if (url.startsWith('//')) url = 'https:' + url;
          else if (url.startsWith('/')) url = 'https://tracktollywood.com' + url;
        }
      }
    }
    return url;
  };
  
  imgUrl = getUrl($(el));
  
  if (!imgUrl) {
    const child = $(el).find('[data-img-url], img, [style*="background-image"], span.entry-thumb').first();
    if (child.length > 0) {
      imgUrl = getUrl(child);
    }
  }
  
  if (!imgUrl) return null;
  
  imgUrl = imgUrl.split('?')[0].trim();
  
  if (imgUrl.includes('data:image/') || imgUrl.endsWith('.gif') || imgUrl.includes('1x1') || imgUrl.includes('placeholder') || imgUrl.includes('transparent')) {
    const node = $(el).is('img') ? $(el) : $(el).find('img').first();
    if (node.length > 0) {
      const srcset = node.attr('srcset') || node.attr('data-srcset');
      if (srcset) {
        const sources = srcset.split(',').map(s => s.trim().split(' ')[0]);
        const bestSource = sources[sources.length - 1];
        if (bestSource && !bestSource.includes('data:image/')) {
          imgUrl = bestSource.split('?')[0].trim();
        }
      }
    }
  }
  
  if (imgUrl.includes('data:image/') || imgUrl.includes('1x1') || imgUrl.includes('transparent')) {
    return null;
  }
  
  if (imgUrl.startsWith('//')) {
    imgUrl = 'https:' + imgUrl;
  } else if (imgUrl.startsWith('/')) {
    imgUrl = 'https://tracktollywood.com' + imgUrl;
  }
  
  return imgUrl;
};

// Smart Movie Name Extraction Helper
const extractMovieName = (title, slug) => {
  if (!title) return 'Live Tracking';
  
  // Try splitting by common box office/review terms
  let name = title.split(/box\s*office|collection[s]?|gross|share|day\s*\d+|worldwide|performance|report|biz|verdict|latest|cr\b|crore|drop|hold|run|re-release|review|rating/i)[0];
  
  // Strip common prefix phrases
  name = name.replace(/^(live\s+tracking\s+(of\s+)?|collections\s+(of\s+)?|box\s+office\s+(of\s+)?|ott\s+release\s+(of\s+)?|review\s+(of\s+)?)/i, '');
  
  name = name.trim().replace(/[:\-–—\s'’"“”()]+$/, '').trim();
  
  // If the extracted name is empty, too long, or contains generic terms, try slug fallback
  if (!name || name.length > 40 || /^(live|tracking|the|a|an|box|collections|gross|latest|update)$/i.test(name)) {
    if (slug) {
      const slugWords = slug.split('-');
      const cleanWords = [];
      for (const word of slugWords) {
        if (/^(box|office|collection|collections|gross|share|day|worldwide|verdict|cr|crore|run|drop|hold|report|massive|huge|sensational|blockbuster|hit|flop|disaster|platform|ott|netflix|prime|aha|zeetv|hotstar|release|review|ratings|rating)$/i.test(word)) {
          break;
        }
        cleanWords.push(word);
      }
      if (cleanWords.length > 0) {
        name = cleanWords.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      }
    }
  }
  
  // Final cleanup fallback
  if (!name || name.length > 40) {
    name = title.split(' ')[0] + ' ' + (title.split(' ')[1] || '');
    name = name.replace(/[:\-–—\s'’"“”()]+$/, '').trim();
  }
  
  return name || 'Live Tracking';
};

// Shared direct scraping helper for single article detail
const scrapeArticleDetail = async (slug) => {
  const targetUrl = `https://tracktollywood.com/${slug}/`;
  const response = await axios.get(targetUrl, axiosConfig);
  const $ = cheerio.load(response.data);
  
  const title = cleanText($('.tdb-title-text, h1.entry-title, .entry-title').first().text());
  const date = $('.td-post-date time, .entry-date, time').first().attr('datetime') || 
               $('.td-post-date time, .entry-date, time').first().text().trim() || 
               new Date().toISOString();
  
  const content = [];
  const contentContainer = $('.td-post-content, .entry-content, .tdb-single-content .tdb-block-inner').first();
  
  if (contentContainer.length > 0) {
    // Clean up inline style and script elements so their CSS/JS code is not extracted as text
    contentContainer.find('style, script').remove();
    contentContainer.find('p, figure, img').each((idx, el) => {
      if ($(el).is('p')) {
        const txt = cleanText($(el).text());
        if (txt && !txt.includes('Google News') && !txt.toLowerCase().includes('follow us on')) {
          content.push({ type: 'paragraph', value: txt });
        }
      } else if ($(el).is('img') || $(el).is('figure')) {
        const img = resolveScrapedImageUrl(el, $);
        if (img && !img.includes('avatar') && !img.includes('logo')) {
          content.push({ type: 'image', value: img });
        }
      }
    });
  }

  if (content.length === 0) {
    content.push({ type: 'paragraph', value: 'Read the full report directly on ChitramBhalare.' });
  }

  const featuredImageImg = $('.td-post-featured-image img, .tdb-featured-image-bg img, .entry-content img').first();
  const featuredImage = resolveScrapedImageUrl(featuredImageImg, $) || 
                        (content.find(c => c.type === 'image')?.value) ||
                        `https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80`;

  return {
    id: slug,
    slug,
    title: title || 'News Article',
    excerpt: content.find(c => c.type === 'paragraph')?.value?.slice(0, 150) + '...',
    content,
    thumbnail: featuredImage,
    featuredImage,
    date,
    category: 'News',
    author: 'ChitramBhalare'
  };
};

// Shared direct scraping helper for box office collections
const scrapeBoxOfficeList = async () => {
  const targetUrl = 'https://tracktollywood.com/category/box-office-news/';
  const response = await axios.get(targetUrl, axiosConfig);
  const $ = cheerio.load(response.data);
  const rawPosts = parseNewspaperPosts($);
  
  return rawPosts.map((post, idx) => {
    let movieName = extractMovieName(post.title, post.slug);

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

    const dayMatch = post.title.match(/day\s*(\d+)/i) || post.excerpt.match(/day\s*(\d+)/i);
    const days = dayMatch ? dayMatch[1] : (5 + idx * 2).toString();

    // Default daily breakdown for realism
    const dailyBreakdown = [
      { day: 'Day 1 (Friday)', indiaNet: `₹${(10 + idx * 2).toFixed(1)} Cr`, worldwideGross: `₹${(15 + idx * 3).toFixed(1)} Cr`, occupancy: '65%' },
      { day: 'Day 2 (Saturday)', indiaNet: `₹${(12 + idx * 2.5).toFixed(1)} Cr`, worldwideGross: `₹${(18 + idx * 3.5).toFixed(1)} Cr`, occupancy: '80%' },
      { day: 'Day 3 (Sunday)', indiaNet: `₹${(14 + idx * 3).toFixed(1)} Cr`, worldwideGross: `₹${(21 + idx * 4).toFixed(1)} Cr`, occupancy: '95%' },
      { day: 'Day 4 (Monday)', indiaNet: `₹${(6 + idx * 1).toFixed(1)} Cr`, worldwideGross: `₹${(9 + idx * 1.5).toFixed(1)} Cr`, occupancy: '45%' },
    ];

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
      date: post.date,
      dailyBreakdown,
      budget: verdict === 'Blockbuster' ? `₹${(40 + idx * 10).toFixed(0)} Cr` : `₹${(60 + idx * 15).toFixed(0)} Cr`,
      totalIndiaNet: `₹${(30 + idx * 5)} Cr`,
      usPremieres: usdMatch ? `$${usdMatch[1]}M` : `$${(0.5 + idx * 0.2).toFixed(1)}M`
    };
  });
};

// Helper to extract posts from a cheerio instance loaded with Newspaper theme HTML
const parseNewspaperPosts = ($) => {
  const posts = [];
  $('.td-module-container, .td_module_wrap, .td-big-grid-post, .tdb_module_loop').each((idx, el) => {
    const titleEl = $(el).find('.entry-title a, .td-module-title a').first();
    const title = cleanText(titleEl.text());
    const href = titleEl.attr('href');
    if (!title || !href) return;

    const slug = href.replace('https://tracktollywood.com/', '').replace(/\/$/, '');
    
    // Parse thumbnail image
    let img = null;
    const imgEl = $(el).find('img, span.entry-thumb, .td-thumb-css').first();
    if (imgEl.length > 0) {
      img = resolveScrapedImageUrl(imgEl, $);
    }
    
    // Background style fallback
    if (!img) {
      const style = $(el).find('.td-thumb-css, span.entry-thumb, [style*="background-image"]').first().attr('style');
      if (style) {
        const match = style.match(/url\s*\(\s*['"]?([^'")]+)['"]?\s*\)/i);
        if (match && match[1]) {
          img = match[1];
          if (img.startsWith('//')) img = 'https:' + img;
          else if (img.startsWith('/')) img = 'https://tracktollywood.com' + img;
        }
      }
    }
                
    const category = cleanText($(el).find('.td-post-category, .entry-category').first().text()) || 'News';
    const date = $(el).find('.td-post-date time, .entry-date, time').first().attr('datetime') || 
                 $(el).find('.td-post-date time, .entry-date, time').first().text().trim() || 
                 new Date().toISOString();
                 
    const excerpt = cleanText($(el).find('.td-excerpt, .entry-excerpt').text());

    posts.push({
      id: slug,
      slug,
      title,
      excerpt: excerpt || `${title}. Read the full report on ChitramBhalare.`,
      thumbnail: img || `https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80`,
      featuredImage: img || `https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80`,
      date,
      category: category === 'Box Office News' ? 'Box Office' : category,
      author: 'ChitramBhalare',
      tags: idx < 10 ? [category, 'Trending', 'Live'] : [category, 'Live']
    });
  });
  return posts;
};

// -------------------- Endpoints --------------------

// 1. GET /api/articles - fetch latest posts (homepage or category)
app.get('/api/articles', async (req, res) => {
  const category = req.query.category;
  const search = req.query.search;
  
  let scraperMode = 'live';
  if (pool) {
    try {
      const settingsResult = await pool.query('SELECT scraper_mode FROM settings ORDER BY id DESC LIMIT 1');
      if (settingsResult.rows.length > 0) {
        scraperMode = settingsResult.rows[0].scraper_mode;
      }
    } catch (e) {
      console.error('Failed to read settings from PG:', e.message);
    }
  } else {
    const db = readDb();
    scraperMode = db.settings?.scraperMode || 'live';
  }

  if (scraperMode === 'mock') {
    if (pool) {
      try {
        let query = 'SELECT id, slug, title, excerpt, content, thumbnail, featured_image, date, category, author, tags FROM articles';
        const params = [];
        const conditions = [];
        
        if (category) {
          params.push(`%${category.toLowerCase().trim()}%`);
          conditions.push(`(LOWER(category) LIKE $${params.length} OR LOWER(tags::text) LIKE $${params.length})`);
        }
        
        if (search) {
          params.push(`%${search.toLowerCase().trim()}%`);
          conditions.push(`(LOWER(title) LIKE $${params.length} OR LOWER(excerpt) LIKE $${params.length})`);
        }
        
        if (conditions.length > 0) {
          query += ' WHERE ' + conditions.join(' AND ');
        }
        
        query += ' ORDER BY date DESC';
        
        const result = await pool.query(query, params);
        const posts = result.rows.map(r => ({
          id: r.id,
          slug: r.slug,
          title: r.title,
          excerpt: r.excerpt,
          content: typeof r.content === 'string' ? JSON.parse(r.content) : r.content,
          thumbnail: r.thumbnail,
          featuredImage: r.featured_image,
          date: r.date,
          category: r.category,
          author: r.author,
          tags: typeof r.tags === 'string' ? JSON.parse(r.tags) : r.tags
        }));
        
        return res.json({
          data: posts,
          total: posts.length,
          page: 1,
          totalPages: 1
        });
      } catch (e) {
        console.error('PG Articles query failed, falling back to file:', e.message);
      }
    }
    
    const db = readDb();
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
    
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));

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
    console.error('Error in /api/articles, falling back to DB/file:', err.message);
    if (pool) {
      try {
        let query = 'SELECT id, slug, title, excerpt, content, thumbnail, featured_image, date, category, author, tags FROM articles';
        const params = [];
        const conditions = [];
        if (category) {
          params.push(`%${category.toLowerCase().trim()}%`);
          conditions.push(`(LOWER(category) LIKE $${params.length} OR LOWER(tags::text) LIKE $${params.length})`);
        }
        if (search) {
          params.push(`%${search.toLowerCase().trim()}%`);
          conditions.push(`(LOWER(title) LIKE $${params.length} OR LOWER(excerpt) LIKE $${params.length})`);
        }
        if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
        query += ' ORDER BY date DESC';
        const result = await pool.query(query, params);
        const posts = result.rows.map(r => ({
          id: r.id,
          slug: r.slug,
          title: r.title,
          excerpt: r.excerpt,
          content: typeof r.content === 'string' ? JSON.parse(r.content) : r.content,
          thumbnail: r.thumbnail,
          featuredImage: r.featured_image,
          date: r.date,
          category: r.category,
          author: r.author,
          tags: typeof r.tags === 'string' ? JSON.parse(r.tags) : r.tags
        }));
        return res.json({ data: posts, total: posts.length, page: 1, totalPages: 1 });
      } catch (e) {
        console.error('Fallback PG Articles query failed:', e.message);
      }
    }
    const db = readDb();
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
  
  let scraperMode = 'live';
  if (pool) {
    try {
      const settingsResult = await pool.query('SELECT scraper_mode FROM settings ORDER BY id DESC LIMIT 1');
      if (settingsResult.rows.length > 0) scraperMode = settingsResult.rows[0].scraper_mode;
    } catch (e) {
      console.error(e);
    }
  } else {
    const db = readDb();
    scraperMode = db.settings?.scraperMode || 'live';
  }

  if (scraperMode === 'mock') {
    if (pool) {
      try {
        const result = await pool.query('SELECT id, slug, title, excerpt, content, thumbnail, featured_image, date, category, author, tags FROM articles WHERE slug = $1', [slug]);
        if (result.rows.length > 0) {
          const r = result.rows[0];
          return res.json({
            id: r.id,
            slug: r.slug,
            title: r.title,
            excerpt: r.excerpt,
            content: typeof r.content === 'string' ? JSON.parse(r.content) : r.content,
            thumbnail: r.thumbnail,
            featuredImage: r.featured_image,
            date: r.date,
            category: r.category,
            author: r.author,
            tags: typeof r.tags === 'string' ? JSON.parse(r.tags) : r.tags
          });
        }
      } catch (e) {
        console.error('PG Article detail lookup failed:', e.message);
      }
    }
    const db = readDb();
    const article = (db.articles || []).find(a => a.slug === slug);
    if (!article) return res.status(404).json({ error: 'Article not found' });
    return res.json(article);
  }

  const cacheKey = `article_detail_${slug}`;
  const cached = getCachedData(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  try {
    const article = await scrapeArticleDetail(slug);
    setCachedData(cacheKey, article);
    res.json(article);
  } catch (err) {
    console.error(`Error in /api/articles/${slug}, falling back to DB/file:`, err.message);
    if (pool) {
      try {
        const result = await pool.query('SELECT id, slug, title, excerpt, content, thumbnail, featured_image, date, category, author, tags FROM articles WHERE slug = $1', [slug]);
        if (result.rows.length > 0) {
          const r = result.rows[0];
          return res.json({
            id: r.id,
            slug: r.slug,
            title: r.title,
            excerpt: r.excerpt,
            content: typeof r.content === 'string' ? JSON.parse(r.content) : r.content,
            thumbnail: r.thumbnail,
            featuredImage: r.featured_image,
            date: r.date,
            category: r.category,
            author: r.author,
            tags: typeof r.tags === 'string' ? JSON.parse(r.tags) : r.tags
          });
        }
      } catch (e) {
        console.error('PG Article detail lookup fallback failed:', e.message);
      }
    }
    const db = readDb();
    const article = (db.articles || []).find(a => a.slug === slug);
    if (!article) return res.status(404).json({ error: 'Article not found' });
    res.json(article);
  }
});

// 3. GET /api/reviews - fetch scraped reviews
app.get('/api/reviews', async (req, res) => {
  let scraperMode = 'live';
  if (pool) {
    try {
      const settingsResult = await pool.query('SELECT scraper_mode FROM settings ORDER BY id DESC LIMIT 1');
      if (settingsResult.rows.length > 0) scraperMode = settingsResult.rows[0].scraper_mode;
    } catch (e) {
      console.error(e);
    }
  } else {
    const db = readDb();
    scraperMode = db.settings?.scraperMode || 'live';
  }

  if (scraperMode === 'mock') {
    if (pool) {
      try {
        const result = await pool.query('SELECT id, slug, movie_name, poster, rating, snippet, verdict, story, performances, technical_aspects, verdict_text, ott_platform, ott_release_date, date FROM reviews ORDER BY date DESC');
        const reviews = result.rows.map(r => ({
          id: r.id,
          slug: r.slug,
          movieName: r.movie_name,
          poster: r.poster,
          rating: r.rating,
          snippet: r.snippet,
          verdict: r.verdict,
          story: r.story,
          performances: r.performances,
          technicalAspects: r.technical_aspects,
          verdictText: r.verdict_text,
          ottPlatform: r.ott_platform,
          ottReleaseDate: r.ott_release_date,
          date: r.date
        }));
        return res.json(reviews);
      } catch (e) {
        console.error('PG Reviews list query failed:', e.message);
      }
    }
    const db = readDb();
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
      let movieName = extractMovieName(post.title, post.slug);
      const ratingMatch = post.title.match(/(\d\.\d|\d)\s*\/\s*5/) || post.excerpt.match(/(\d\.\d|\d)\s*\/\s*5/);
      const rating = ratingMatch ? ratingMatch[1] : (3.0 + (idx % 3) * 0.5).toFixed(1);

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
    if (pool) {
      try {
        const result = await pool.query('SELECT id, slug, movie_name, poster, rating, snippet, verdict, story, performances, technical_aspects, verdict_text, ott_platform, ott_release_date, date FROM reviews ORDER BY date DESC');
        return res.json(result.rows.map(r => ({
          id: r.id,
          slug: r.slug,
          movieName: r.movie_name,
          poster: r.poster,
          rating: r.rating,
          snippet: r.snippet,
          verdict: r.verdict,
          story: r.story,
          performances: r.performances,
          technicalAspects: r.technical_aspects,
          verdictText: r.verdict_text,
          ottPlatform: r.ott_platform,
          ottReleaseDate: r.ott_release_date,
          date: r.date
        })));
      } catch (e) {
        console.error(e);
      }
    }
    const db = readDb();
    res.json(db.reviews || []);
  }
});

// 3.1 GET /api/reviews/:slug - get detailed review content
app.get('/api/reviews/:slug', async (req, res) => {
  const slug = req.params.slug;
  let scraperMode = 'live';
  if (pool) {
    try {
      const settingsResult = await pool.query('SELECT scraper_mode FROM settings ORDER BY id DESC LIMIT 1');
      if (settingsResult.rows.length > 0) scraperMode = settingsResult.rows[0].scraper_mode;
    } catch (e) {
      console.error(e);
    }
  } else {
    const db = readDb();
    scraperMode = db.settings?.scraperMode || 'live';
  }

  if (scraperMode === 'live') {
    try {
      const article = await scrapeArticleDetail(slug);
      let movieName = extractMovieName(article.title, article.slug);
      
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

  if (pool) {
    try {
      const result = await pool.query('SELECT id, slug, movie_name, poster, rating, snippet, verdict, story, performances, technical_aspects, verdict_text, ott_platform, ott_release_date, date FROM reviews WHERE slug = $1', [slug]);
      if (result.rows.length > 0) {
        const r = result.rows[0];
        return res.json({
          id: r.id,
          slug: r.slug,
          movieName: r.movie_name,
          poster: r.poster,
          rating: r.rating,
          snippet: r.snippet,
          verdict: r.verdict,
          story: r.story,
          performances: r.performances,
          technicalAspects: r.technical_aspects,
          verdictText: r.verdict_text,
          ottPlatform: r.ott_platform,
          ottReleaseDate: r.ott_release_date,
          date: r.date
        });
      }
    } catch (e) {
      console.error(e);
    }
  }

  const db = readDb();
  const review = (db.reviews || []).find(r => r.slug === slug);
  if (!review) return res.status(404).json({ error: 'Review not found' });
  res.json(review);
});

// 4. GET /api/boxoffice - fetch scraped box office collection cards
app.get('/api/box-office', async (req, res) => {
  let scraperMode = 'live';
  if (pool) {
    try {
      const settingsResult = await pool.query('SELECT scraper_mode FROM settings ORDER BY id DESC LIMIT 1');
      if (settingsResult.rows.length > 0) scraperMode = settingsResult.rows[0].scraper_mode;
    } catch (e) {
      console.error(e);
    }
  } else {
    const db = readDb();
    scraperMode = db.settings?.scraperMode || 'live';
  }

  if (scraperMode === 'mock') {
    if (pool) {
      try {
        const result = await pool.query('SELECT id, slug, movie_name, director, movie_cast, poster, day_collection, worldwide_gross, india_net, india_gross, overseas, verdict, trend, days, languages, percentage, date, daily_breakdown, budget, total_india_net, us_premieres FROM box_office ORDER BY date DESC');
        const boxOffice = result.rows.map(r => ({
          id: r.id,
          slug: r.slug,
          movieName: r.movie_name,
          director: r.director,
          cast: r.movie_cast,
          poster: r.poster,
          dayCollection: r.day_collection,
          worldwideGross: r.worldwide_gross,
          indiaNet: r.india_net,
          indiaGross: r.india_gross,
          overseas: r.overseas,
          verdict: r.verdict,
          trend: r.trend,
          days: r.days,
          languages: r.languages,
          percentage: r.percentage,
          date: r.date,
          dailyBreakdown: typeof r.daily_breakdown === 'string' ? JSON.parse(r.daily_breakdown) : r.daily_breakdown,
          budget: r.budget,
          totalIndiaNet: r.total_india_net,
          usPremieres: r.us_premieres
        }));
        return res.json(boxOffice);
      } catch (e) {
        console.error('PG Box office query failed:', e.message);
      }
    }
    const db = readDb();
    return res.json(db.boxOffice || []);
  }

  const cacheKey = 'boxoffice_list';
  const cached = getCachedData(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  try {
    const boxOffice = await scrapeBoxOfficeList();
    setCachedData(cacheKey, boxOffice);
    res.json(boxOffice);
  } catch (err) {
    console.error('Error in /api/boxoffice, falling back to DB:', err.message);
    if (pool) {
      try {
        const result = await pool.query('SELECT id, slug, movie_name, director, movie_cast, poster, day_collection, worldwide_gross, india_net, india_gross, overseas, verdict, trend, days, languages, percentage, date, daily_breakdown, budget, total_india_net, us_premieres FROM box_office ORDER BY date DESC');
        return res.json(result.rows.map(r => ({
          id: r.id,
          slug: r.slug,
          movieName: r.movie_name,
          director: r.director,
          cast: r.movie_cast,
          poster: r.poster,
          dayCollection: r.day_collection,
          worldwideGross: r.worldwide_gross,
          indiaNet: r.india_net,
          indiaGross: r.india_gross,
          overseas: r.overseas,
          verdict: r.verdict,
          trend: r.trend,
          days: r.days,
          languages: r.languages,
          percentage: r.percentage,
          date: r.date,
          dailyBreakdown: typeof r.daily_breakdown === 'string' ? JSON.parse(r.daily_breakdown) : r.daily_breakdown,
          budget: r.budget,
          totalIndiaNet: r.total_india_net,
          usPremieres: r.us_premieres
        })));
      } catch (e) {
        console.error(e);
      }
    }
    const db = readDb();
    res.json(db.boxOffice || []);
  }
});

// 4.1 GET /api/box-office/:slug - get detailed box office movie content
app.get('/api/box-office/:slug', async (req, res) => {
  const slug = req.params.slug;
  let scraperMode = 'live';
  if (pool) {
    try {
      const settingsResult = await pool.query('SELECT scraper_mode FROM settings ORDER BY id DESC LIMIT 1');
      if (settingsResult.rows.length > 0) scraperMode = settingsResult.rows[0].scraper_mode;
    } catch (e) {
      console.error(e);
    }
  } else {
    const db = readDb();
    scraperMode = db.settings?.scraperMode || 'live';
  }

  if (scraperMode === 'live') {
    try {
      const list = await scrapeBoxOfficeList();
      const film = list.find(b => b.slug === slug);
      if (film) return res.json(film);
    } catch (e) {
      console.warn('Scraper failed for box office detail, falling back to DB:', e.message);
    }
  }

  if (pool) {
    try {
      const result = await pool.query('SELECT id, slug, movie_name, director, movie_cast, poster, day_collection, worldwide_gross, india_net, india_gross, overseas, verdict, trend, days, languages, percentage, date, daily_breakdown, budget, total_india_net, us_premieres FROM box_office WHERE slug = $1', [slug]);
      if (result.rows.length > 0) {
        const r = result.rows[0];
        return res.json({
          id: r.id,
          slug: r.slug,
          movieName: r.movie_name,
          director: r.director,
          cast: r.movie_cast,
          poster: r.poster,
          dayCollection: r.day_collection,
          worldwideGross: r.worldwide_gross,
          indiaNet: r.india_net,
          indiaGross: r.india_gross,
          overseas: r.overseas,
          verdict: r.verdict,
          trend: r.trend,
          days: r.days,
          languages: r.languages,
          percentage: r.percentage,
          date: r.date,
          dailyBreakdown: typeof r.daily_breakdown === 'string' ? JSON.parse(r.daily_breakdown) : r.daily_breakdown,
          budget: r.budget,
          totalIndiaNet: r.total_india_net,
          usPremieres: r.us_premieres
        });
      }
    } catch (e) {
      console.error(e);
    }
  }

  const db = readDb();
  const bo = (db.boxOffice || []).find(b => b.slug === slug);
  if (!bo) return res.status(404).json({ error: 'Box office entry not found' });
  res.json(bo);
});

// 5. GET /api/db - get entire database state
app.get('/api/db', requireAdminPasscode, async (req, res) => {
  if (pool) {
    try {
      const settingsRes = await pool.query('SELECT scraper_mode FROM settings ORDER BY id DESC LIMIT 1');
      const popupRes = await pool.query('SELECT active, title, image_url, link_url, button_text FROM popup_ad ORDER BY id DESC LIMIT 1');
      const schedulesRes = await pool.query('SELECT id, movie_name, release_date, language, status FROM schedules ORDER BY release_date ASC');
      const naRes = await pool.query('SELECT id, movie_name, hourly_gross, total_gross, premier_gross, screens, status, last_updated, poster FROM north_america ORDER BY id ASC');
      const bo5Res = await pool.query('SELECT rank, movie_name, gross, verdict, trend FROM box_office_top5 ORDER BY rank ASC');
      const galleriesRes = await pool.query('SELECT id, title, cover_image, images, date FROM galleries ORDER BY id ASC');
      const articlesRes = await pool.query('SELECT id, slug, title, excerpt, content, thumbnail, featured_image, date, category, author, tags FROM articles ORDER BY date DESC');
      const reviewsRes = await pool.query('SELECT id, slug, movie_name, poster, rating, snippet, verdict, story, performances, technical_aspects, verdict_text, ott_platform, ott_release_date, date FROM reviews ORDER BY date DESC');
      const boRes = await pool.query('SELECT id, slug, movie_name, director, movie_cast, poster, day_collection, worldwide_gross, india_net, india_gross, overseas, verdict, trend, days, languages, percentage, date, daily_breakdown, budget, total_india_net, us_premieres FROM box_office ORDER BY date DESC');
      
      const db = {
        settings: { scraperMode: settingsRes.rows[0]?.scraper_mode || 'live' },
        popupAd: popupRes.rows[0] ? {
          active: popupRes.rows[0].active,
          title: popupRes.rows[0].title,
          imageUrl: popupRes.rows[0].image_url,
          linkUrl: popupRes.rows[0].link_url,
          buttonText: popupRes.rows[0].button_text
        } : { active: false },
        upcomingSchedules: schedulesRes.rows.map(r => ({
          id: r.id,
          movieName: r.movie_name,
          releaseDate: r.release_date,
          language: r.language,
          status: r.status
        })),
        northAmericaCollections: naRes.rows.map(r => ({
          id: r.id,
          movieName: r.movie_name,
          hourlyGross: r.hourly_gross,
          totalGross: r.total_gross,
          premierGross: r.premier_gross,
          screens: r.screens,
          status: r.status,
          lastUpdated: r.last_updated,
          poster: r.poster
        })),
        boxOfficeTop5: bo5Res.rows.map(r => ({
          rank: r.rank,
          movieName: r.movie_name,
          gross: r.gross,
          verdict: r.verdict,
          trend: r.trend
        })),
        galleries: galleriesRes.rows.map(r => ({
          id: r.id,
          title: r.title,
          coverImage: r.cover_image,
          images: typeof r.images === 'string' ? JSON.parse(r.images) : r.images,
          date: r.date
        })),
        articles: articlesRes.rows.map(r => ({
          id: r.id,
          slug: r.slug,
          title: r.title,
          excerpt: r.excerpt,
          content: typeof r.content === 'string' ? JSON.parse(r.content) : r.content,
          thumbnail: r.thumbnail,
          featuredImage: r.featured_image,
          date: r.date,
          category: r.category,
          author: r.author,
          tags: typeof r.tags === 'string' ? JSON.parse(r.tags) : r.tags
        })),
        reviews: reviewsRes.rows.map(r => ({
          id: r.id,
          slug: r.slug,
          movieName: r.movie_name,
          poster: r.poster,
          rating: r.rating,
          snippet: r.snippet,
          verdict: r.verdict,
          story: r.story,
          performances: r.performances,
          technicalAspects: r.technical_aspects,
          verdictText: r.verdict_text,
          ottPlatform: r.ott_platform,
          ottReleaseDate: r.ott_release_date,
          date: r.date
        })),
        boxOffice: boRes.rows.map(r => ({
          id: r.id,
          slug: r.slug,
          movieName: r.movie_name,
          director: r.director,
          cast: r.movie_cast,
          poster: r.poster,
          dayCollection: r.day_collection,
          worldwideGross: r.worldwide_gross,
          indiaNet: r.india_net,
          indiaGross: r.india_gross,
          overseas: r.overseas,
          verdict: r.verdict,
          trend: r.trend,
          days: r.days,
          languages: r.languages,
          percentage: r.percentage,
          date: r.date,
          dailyBreakdown: typeof r.daily_breakdown === 'string' ? JSON.parse(r.daily_breakdown) : r.daily_breakdown,
          budget: r.budget,
          totalIndiaNet: r.total_india_net,
          usPremieres: r.us_premieres
        }))
      };
      return res.json(db);
    } catch (e) {
      console.error('PG GET /api/db failed:', e.message);
    }
  }
  res.json(readDb());
});

// 5.1 POST /api/db/reset - reset database state to seed mock data
app.post('/api/db/reset', requireAdminPasscode, async (req, res) => {
  if (pool) {
    try {
      console.log('Resetting PG Database tables...');
      await pool.query('DROP TABLE IF EXISTS settings, popup_ad, schedules, north_america, box_office_top5, articles, reviews, box_office, galleries CASCADE');
      await initDb();
      
      const settingsRes = await pool.query('SELECT scraper_mode FROM settings ORDER BY id DESC LIMIT 1');
      const popupRes = await pool.query('SELECT active, title, image_url, link_url, button_text FROM popup_ad ORDER BY id DESC LIMIT 1');
      const schedulesRes = await pool.query('SELECT id, movie_name, release_date, language, status FROM schedules ORDER BY release_date ASC');
      const naRes = await pool.query('SELECT id, movie_name, hourly_gross, total_gross, premier_gross, screens, status, last_updated, poster FROM north_america ORDER BY id ASC');
      const bo5Res = await pool.query('SELECT rank, movie_name, gross, verdict, trend FROM box_office_top5 ORDER BY rank ASC');
      const galleriesRes = await pool.query('SELECT id, title, cover_image, images, date FROM galleries ORDER BY id ASC');
      const articlesRes = await pool.query('SELECT id, slug, title, excerpt, content, thumbnail, featured_image, date, category, author, tags FROM articles ORDER BY date DESC');
      const reviewsRes = await pool.query('SELECT id, slug, movie_name, poster, rating, snippet, verdict, story, performances, technical_aspects, verdict_text, ott_platform, ott_release_date, date FROM reviews ORDER BY date DESC');
      const boRes = await pool.query('SELECT id, slug, movie_name, director, movie_cast, poster, day_collection, worldwide_gross, india_net, india_gross, overseas, verdict, trend, days, languages, percentage, date, daily_breakdown, budget, total_india_net, us_premieres FROM box_office ORDER BY date DESC');
      
      const db = {
        settings: { scraperMode: settingsRes.rows[0]?.scraper_mode || 'live' },
        popupAd: popupRes.rows[0] ? {
          active: popupRes.rows[0].active,
          title: popupRes.rows[0].title,
          imageUrl: popupRes.rows[0].image_url,
          linkUrl: popupRes.rows[0].link_url,
          buttonText: popupRes.rows[0].button_text
        } : { active: false },
        upcomingSchedules: schedulesRes.rows.map(r => ({
          id: r.id,
          movieName: r.movie_name,
          releaseDate: r.release_date,
          language: r.language,
          status: r.status
        })),
        northAmericaCollections: naRes.rows.map(r => ({
          id: r.id,
          movieName: r.movie_name,
          hourlyGross: r.hourly_gross,
          totalGross: r.total_gross,
          premierGross: r.premier_gross,
          screens: r.screens,
          status: r.status,
          lastUpdated: r.last_updated,
          poster: r.poster
        })),
        boxOfficeTop5: bo5Res.rows.map(r => ({
          rank: r.rank,
          movieName: r.movie_name,
          gross: r.gross,
          verdict: r.verdict,
          trend: r.trend
        })),
        galleries: galleriesRes.rows.map(r => ({
          id: r.id,
          title: r.title,
          coverImage: r.cover_image,
          images: typeof r.images === 'string' ? JSON.parse(r.images) : r.images,
          date: r.date
        })),
        articles: articlesRes.rows.map(r => ({
          id: r.id,
          slug: r.slug,
          title: r.title,
          excerpt: r.excerpt,
          content: typeof r.content === 'string' ? JSON.parse(r.content) : r.content,
          thumbnail: r.thumbnail,
          featuredImage: r.featured_image,
          date: r.date,
          category: r.category,
          author: r.author,
          tags: typeof r.tags === 'string' ? JSON.parse(r.tags) : r.tags
        })),
        reviews: reviewsRes.rows.map(r => ({
          id: r.id,
          slug: r.slug,
          movieName: r.movie_name,
          poster: r.poster,
          rating: r.rating,
          snippet: r.snippet,
          verdict: r.verdict,
          story: r.story,
          performances: r.performances,
          technicalAspects: r.technical_aspects,
          verdictText: r.verdict_text,
          ottPlatform: r.ott_platform,
          ottReleaseDate: r.ott_release_date,
          date: r.date
        })),
        boxOffice: boRes.rows.map(r => ({
          id: r.id,
          slug: r.slug,
          movieName: r.movie_name,
          director: r.director,
          cast: r.movie_cast,
          poster: r.poster,
          dayCollection: r.day_collection,
          worldwideGross: r.worldwide_gross,
          indiaNet: r.india_net,
          indiaGross: r.india_gross,
          overseas: r.overseas,
          verdict: r.verdict,
          trend: r.trend,
          days: r.days,
          languages: r.languages,
          percentage: r.percentage,
          date: r.date,
          dailyBreakdown: typeof r.daily_breakdown === 'string' ? JSON.parse(r.daily_breakdown) : r.daily_breakdown,
          budget: r.budget,
          totalIndiaNet: r.total_india_net,
          usPremieres: r.us_premieres
        }))
      };
      return res.json(db);
    } catch (e) {
      console.error('PG DB reset failed:', e.message);
      return res.status(500).json({ error: 'Failed to reset PG database' });
    }
  }
  
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
app.get('/api/settings', async (req, res) => {
  if (pool) {
    try {
      const result = await pool.query('SELECT scraper_mode FROM settings ORDER BY id DESC LIMIT 1');
      const scraperMode = result.rows[0]?.scraper_mode || 'live';
      return res.json({ scraperMode });
    } catch (e) {
      console.error('PG Settings read failed:', e.message);
    }
  }
  const db = readDb();
  res.json(db.settings || { scraperMode: 'live' });
});

// 6.1 POST /api/settings - update settings config
app.post('/api/settings', requireAdminPasscode, async (req, res) => {
  const { scraperMode } = req.body;
  if (pool) {
    try {
      await pool.query('DELETE FROM settings');
      await pool.query('INSERT INTO settings (scraper_mode) VALUES ($1)', [scraperMode]);
      return res.json({ success: true, settings: { scraperMode } });
    } catch (e) {
      console.error('PG Settings write failed:', e.message);
    }
  }
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
app.get('/api/popup-ad', async (req, res) => {
  if (pool) {
    try {
      const result = await pool.query('SELECT active, title, image_url, link_url, button_text FROM popup_ad ORDER BY id DESC LIMIT 1');
      if (result.rows.length > 0) {
        const ad = result.rows[0];
        return res.json({
          active: ad.active,
          title: ad.title,
          imageUrl: ad.image_url,
          linkUrl: ad.link_url,
          buttonText: ad.button_text
        });
      }
    } catch (e) {
      console.error('PG Popup ad read failed:', e.message);
    }
  }
  const db = readDb();
  res.json(db.popupAd || { active: false });
});

// 7.1 POST /api/popup-ad - update popup ad
app.post('/api/popup-ad', requireAdminPasscode, async (req, res) => {
  const ad = req.body;
  if (pool) {
    try {
      await pool.query('DELETE FROM popup_ad');
      await pool.query(
        'INSERT INTO popup_ad (active, title, image_url, link_url, button_text) VALUES ($1, $2, $3, $4, $5)',
        [ad.active, ad.title, ad.imageUrl, ad.linkUrl, ad.buttonText]
      );
      return res.json({ success: true, popupAd: ad });
    } catch (e) {
      console.error('PG Popup ad write failed:', e.message);
    }
  }
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
app.get('/api/schedules', async (req, res) => {
  if (pool) {
    try {
      const result = await pool.query('SELECT id, movie_name, release_date, language, status FROM schedules ORDER BY release_date ASC');
      const schedules = result.rows.map(r => ({
        id: r.id,
        movieName: r.movie_name,
        releaseDate: r.release_date,
        language: r.language,
        status: r.status
      }));
      return res.json(schedules);
    } catch (e) {
      console.error('PG Schedules read failed:', e.message);
    }
  }
  const db = readDb();
  res.json(db.upcomingSchedules || []);
});

// 8.1 POST /api/schedules - save upcoming release schedules
app.post('/api/schedules', requireAdminPasscode, async (req, res) => {
  const list = req.body;
  if (pool) {
    try {
      await pool.query('DELETE FROM schedules');
      for (const s of list) {
        await pool.query(
          'INSERT INTO schedules (movie_name, release_date, language, status) VALUES ($1, $2, $3, $4)',
          [s.movieName, s.releaseDate, s.language, s.status]
        );
      }
      const result = await pool.query('SELECT id, movie_name, release_date, language, status FROM schedules ORDER BY release_date ASC');
      return res.json({
        success: true,
        upcomingSchedules: result.rows.map(r => ({
          id: r.id,
          movieName: r.movie_name,
          releaseDate: r.release_date,
          language: r.language,
          status: r.status
        }))
      });
    } catch (e) {
      console.error('PG Schedules write failed:', e.message);
    }
  }
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
app.get('/api/north-america', async (req, res) => {
  if (pool) {
    try {
      const result = await pool.query('SELECT id, movie_name, hourly_gross, total_gross, premier_gross, screens, status, last_updated, poster FROM north_america ORDER BY id ASC');
      const collections = result.rows.map(r => ({
        id: r.id,
        movieName: r.movie_name,
        hourlyGross: r.hourly_gross,
        totalGross: r.total_gross,
        premierGross: r.premier_gross,
        screens: r.screens,
        status: r.status,
        lastUpdated: r.last_updated,
        poster: r.poster
      }));
      return res.json(collections);
    } catch (e) {
      console.error('PG North America read failed:', e.message);
    }
  }
  const db = readDb();
  res.json(db.northAmericaCollections || []);
});

// 9.1 POST /api/north-america - save North America collections
app.post('/api/north-america', requireAdminPasscode, async (req, res) => {
  const list = req.body;
  if (pool) {
    try {
      await pool.query('DELETE FROM north_america');
      for (const n of list) {
        await pool.query(
          'INSERT INTO north_america (movie_name, hourly_gross, total_gross, premier_gross, screens, status, last_updated, poster) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
          [n.movieName, n.hourlyGross, n.totalGross, n.premierGross, n.screens, n.status, n.lastUpdated, n.poster]
        );
      }
      const result = await pool.query('SELECT id, movie_name, hourly_gross, total_gross, premier_gross, screens, status, last_updated, poster FROM north_america ORDER BY id ASC');
      return res.json({
        success: true,
        northAmericaCollections: result.rows.map(r => ({
          id: r.id,
          movieName: r.movie_name,
          hourlyGross: r.hourly_gross,
          totalGross: r.total_gross,
          premierGross: r.premier_gross,
          screens: r.screens,
          status: r.status,
          lastUpdated: r.last_updated,
          poster: r.poster
        }))
      });
    } catch (e) {
      console.error('PG North America write failed:', e.message);
    }
  }
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
app.get('/api/box-office-top5', async (req, res) => {
  if (pool) {
    try {
      const result = await pool.query('SELECT rank, movie_name, gross, verdict, trend FROM box_office_top5 ORDER BY rank ASC');
      const top5 = result.rows.map(r => ({
        rank: r.rank,
        movieName: r.movie_name,
        gross: r.gross,
        verdict: r.verdict,
        trend: r.trend
      }));
      return res.json(top5);
    } catch (e) {
      console.error('PG Box Office Top 5 read failed:', e.message);
    }
  }
  const db = readDb();
  res.json(db.boxOfficeTop5 || []);
});

// 10.1 POST /api/box-office-top5 - save Box Office Top 5
app.post('/api/box-office-top5', requireAdminPasscode, async (req, res) => {
  const list = req.body;
  if (pool) {
    try {
      await pool.query('DELETE FROM box_office_top5');
      for (const b of list) {
        await pool.query(
          'INSERT INTO box_office_top5 (rank, movie_name, gross, verdict, trend) VALUES ($1, $2, $3, $4, $5)',
          [b.rank, b.movieName, b.gross, b.verdict, b.trend]
        );
      }
      const result = await pool.query('SELECT rank, movie_name, gross, verdict, trend FROM box_office_top5 ORDER BY rank ASC');
      return res.json({
        success: true,
        boxOfficeTop5: result.rows.map(r => ({
          rank: r.rank,
          movieName: r.movie_name,
          gross: r.gross,
          verdict: r.verdict,
          trend: r.trend
        }))
      });
    } catch (e) {
      console.error('PG Box Office Top 5 write failed:', e.message);
    }
  }
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
app.get('/api/galleries', async (req, res) => {
  if (pool) {
    try {
      const result = await pool.query('SELECT id, title, cover_image, images, date FROM galleries ORDER BY id ASC');
      const galleries = result.rows.map(r => ({
        id: r.id,
        title: r.title,
        coverImage: r.cover_image,
        images: typeof r.images === 'string' ? JSON.parse(r.images) : r.images,
        date: r.date
      }));
      return res.json(galleries);
    } catch (e) {
      console.error('PG Galleries read failed:', e.message);
    }
  }
  const db = readDb();
  res.json(db.galleries || []);
});

// Serve static assets in production
app.use(express.static(path.join(__dirname, 'dist')));

// Catch-all route to serve React's index.html
app.get('*all', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Not Found' });
  }
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start listening
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Live Scraper Backend Server running at http://localhost:${PORT}`);
  });
}

module.exports = app;
