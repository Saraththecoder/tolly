import fs from 'fs';
import path from 'path';

const categories = ['Tollywood', 'Bollywood', 'Hollywood', 'OTT', 'Interviews', 'Gossips'];
const ottPlatforms = ['Netflix', 'Amazon Prime', 'Aha', 'Disney+ Hotstar', 'Zee5', 'Theatrical'];

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const generateArticles = () => {
  const articles = [];
  let idCounter = 1;
  
  // Generate 10 articles for each letter of the alphabet
  alphabet.forEach(letter => {
    for (let i = 1; i <= 10; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      
      articles.push({
        id: idCounter,
        slug: `movie-news-article-${idCounter}`,
        title: `${letter}${Math.random().toString(36).substring(2, 8)} - Update on Project ${idCounter}`,
        excerpt: `Here is a quick sneak peek into the highly anticipated movie project ${idCounter}. The team is working hard to deliver an unforgettable experience.`,
        content: [
          { type: "paragraph", value: `This is the detailed first paragraph for article ${idCounter}. The filmmakers have revealed that the pre-production phase is almost complete.` },
          { type: "image", value: `https://picsum.photos/seed/article${idCounter}_1/800/400` },
          { type: "paragraph", value: `The lead actor shared some behind-the-scenes moments on social media, creating a massive buzz among fans.` },
          { type: "image", value: `https://picsum.photos/seed/article${idCounter}_2/800/400` },
          { type: "paragraph", value: `Stay tuned for more updates as we get closer to the official teaser launch next month.` }
        ],
        thumbnail: `https://picsum.photos/seed/article_thumb${idCounter}/400/250`,
        featuredImage: `https://picsum.photos/seed/article${idCounter}_1/1200/600`,
        date: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
        category: category,
        author: `Author ${idCounter % 5 + 1}`,
        tags: Math.random() > 0.5 ? ['Trending', 'Exclusive'] : ['Update', 'Buzz']
      });
      
      idCounter++;
    }
  });
  return articles;
};

const generateReviews = () => {
  const reviews = [];
  for (let i = 1; i <= 20; i++) {
    const ottPlatform = ottPlatforms[Math.floor(Math.random() * ottPlatforms.length)];
    reviews.push({
      id: i,
      slug: `movie-review-${i}`,
      movieName: `Epic Saga Part ${i}`,
      poster: `https://picsum.photos/seed/review${i}/300/450`,
      rating: (Math.random() * 2 + 2.5).toFixed(1),
      snippet: `A visually stunning cinematic experience that keeps you on the edge of your seat.`,
      story: `The story revolves around a protagonist facing impossible odds in a futuristic society. The narrative takes unexpected turns, exploring themes of survival and hope.`,
      performances: `The lead cast delivers career-best performances, bringing emotional depth to the narrative. The supporting cast is equally brilliant, adding layers to the story.`,
      technicalAspects: `Cinematography is top-notch. The VFX team has outdone themselves with breathtaking visuals. The background score elevates every crucial scene perfectly.`,
      verdict: `A must-watch for fans of the genre. It sets a new benchmark for upcoming films.`,
      ottPlatform: ottPlatform,
      ottReleaseDate: ottPlatform !== 'Theatrical' ? 'Coming Soon' : 'In Cinemas Now',
      date: new Date(Date.now() - Math.floor(Math.random() * 5000000000)).toISOString(),
    });
  }
  return reviews;
};

const generateBoxOffice = () => {
  const boxOffice = [];
  for (let i = 1; i <= 20; i++) {
    const dailyBreakdown = [];
    let totalGross = 0;
    let totalNet = 0;
    for (let day = 1; day <= 7; day++) {
      const gross = parseFloat((Math.random() * 15 + 2).toFixed(2));
      const net = parseFloat((gross * 0.8).toFixed(2));
      totalGross += gross;
      totalNet += net;
      dailyBreakdown.push({
        day: day,
        date: new Date(Date.now() - (7 - day) * 86400000).toLocaleDateString(),
        gross: `${gross.toFixed(2)} Cr`,
        net: `${net.toFixed(2)} Cr`
      });
    }

    boxOffice.push({
      id: i,
      slug: `box-office-movie-${i}`,
      movieName: `Blockbuster Hit ${i}`,
      poster: `https://picsum.photos/seed/boxoffice${i}/300/450`,
      dayCollection: `${dailyBreakdown[dailyBreakdown.length - 1].gross}`,
      worldwideGross: `${(totalGross + Math.random() * 50).toFixed(2)} Cr`,
      indiaNet: `${totalNet.toFixed(2)} Cr`,
      indiaGross: `${totalGross.toFixed(2)} Cr`,
      overseas: `${(Math.random() * 40 + 10).toFixed(2)} Cr`,
      dailyBreakdown: dailyBreakdown,
      verdict: Math.random() > 0.5 ? 'Blockbuster' : 'Hit',
      date: new Date(Date.now() - Math.floor(Math.random() * 2000000000)).toISOString(),
    });
  }
  return boxOffice;
};

const generateGalleries = () => {
  const galleries = [];
  for (let i = 1; i <= 12; i++) {
    galleries.push({
      id: i,
      title: `Exclusive Movie Stills ${i}`,
      coverImage: `https://picsum.photos/seed/gallery_cover_${i}/600/400`,
      images: [
        { url: `https://picsum.photos/seed/gallery_${i}_1/800/600`, caption: 'Behind the scenes' },
        { url: `https://picsum.photos/seed/gallery_${i}_2/800/600`, caption: 'Lead actor in action' },
        { url: `https://picsum.photos/seed/gallery_${i}_3/800/600`, caption: 'Director framing the shot' },
        { url: `https://picsum.photos/seed/gallery_${i}_4/800/600`, caption: 'Stunning cinematography' }
      ],
      date: new Date(Date.now() - Math.floor(Math.random() * 3000000000)).toISOString(),
    });
  }
  return galleries;
};

const mockData = {
  articles: generateArticles(),
  reviews: generateReviews(),
  boxOffice: generateBoxOffice(),
  galleries: generateGalleries(),
};

const outputPath = path.join(process.cwd(), 'src', 'data', 'mockData.json');
fs.writeFileSync(outputPath, JSON.stringify(mockData, null, 2));
console.log(`Mock data generated at ${outputPath}`);
