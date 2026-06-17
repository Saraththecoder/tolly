import fs from 'fs';
import path from 'path';

const categories = ['Tollywood', 'Bollywood', 'Hollywood', 'OTT', 'Interviews', 'Gossips'];

const generateArticles = () => {
  const articles = [];
  for (let i = 1; i <= 50; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    articles.push({
      id: i,
      slug: `movie-news-article-${i}`,
      title: `Exciting Update on Upcoming Blockbuster Project ${i}`,
      excerpt: `Here is a quick sneak peek into the highly anticipated movie project ${i}. The team is working hard to deliver an unforgettable experience.`,
      content: [
        { type: "paragraph", value: `This is the detailed first paragraph for article ${i}. The filmmakers have revealed that the pre-production phase is almost complete.` },
        { type: "image", value: `https://picsum.photos/seed/article${i}_1/800/400` },
        { type: "paragraph", value: `The lead actor shared some behind-the-scenes moments on social media, creating a massive buzz among fans.` },
        { type: "image", value: `https://picsum.photos/seed/article${i}_2/800/400` },
        { type: "paragraph", value: `Stay tuned for more updates as we get closer to the official teaser launch next month.` }
      ],
      thumbnail: `https://picsum.photos/seed/article_thumb${i}/400/250`,
      featuredImage: `https://picsum.photos/seed/article${i}_1/1200/600`,
      date: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
      category: category,
      author: `Author ${i % 5 + 1}`,
      tags: ['Trending', 'Exclusive', 'Update']
    });
  }
  return articles;
};

const generateReviews = () => {
  const reviews = [];
  for (let i = 1; i <= 20; i++) {
    reviews.push({
      id: i,
      slug: `movie-review-${i}`,
      movieName: `Epic Saga Part ${i}`,
      poster: `https://picsum.photos/seed/review${i}/300/450`,
      rating: (Math.random() * 2 + 2.5).toFixed(1),
      snippet: `A visually stunning cinematic experience that keeps you on the edge of your seat.`,
      story: `The story revolves around a protagonist facing impossible odds in a futuristic society...`,
      performances: `The lead cast delivers career-best performances, bringing emotional depth to the narrative.`,
      technicalAspects: `Cinematography is top-notch. The VFX team has outdone themselves with breathtaking visuals.`,
      verdict: `A must-watch for fans of the genre. It sets a new benchmark for upcoming films.`,
      date: new Date(Date.now() - Math.floor(Math.random() * 5000000000)).toISOString(),
    });
  }
  return reviews;
};

const generateBoxOffice = () => {
  const boxOffice = [];
  for (let i = 1; i <= 20; i++) {
    boxOffice.push({
      id: i,
      slug: `box-office-movie-${i}`,
      movieName: `Blockbuster Hit ${i}`,
      poster: `https://picsum.photos/seed/boxoffice${i}/300/450`,
      dayCollection: `${(Math.random() * 10 + 2).toFixed(1)} Cr`,
      worldwideGross: `${(Math.random() * 100 + 50).toFixed(1)} Cr`,
      indiaNet: `${(Math.random() * 50 + 20).toFixed(1)} Cr`,
      indiaGross: `${(Math.random() * 60 + 25).toFixed(1)} Cr`,
      overseas: `${(Math.random() * 40 + 10).toFixed(1)} Cr`,
      collections: [
        { day: 'Day 1', collection: `${(Math.random() * 15 + 5).toFixed(1)} Cr` },
        { day: 'Day 2', collection: `${(Math.random() * 12 + 4).toFixed(1)} Cr` },
        { day: 'Day 3', collection: `${(Math.random() * 14 + 6).toFixed(1)} Cr` },
      ],
      verdict: Math.random() > 0.5 ? 'Blockbuster' : 'Hit',
      date: new Date(Date.now() - Math.floor(Math.random() * 2000000000)).toISOString(),
    });
  }
  return boxOffice;
};

const mockData = {
  articles: generateArticles(),
  reviews: generateReviews(),
  boxOffice: generateBoxOffice(),
};

const outputPath = path.join(process.cwd(), 'src', 'data', 'mockData.json');
fs.writeFileSync(outputPath, JSON.stringify(mockData, null, 2));
console.log(`Mock data generated at ${outputPath}`);
