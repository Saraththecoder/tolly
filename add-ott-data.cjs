const fs = require('fs');

const dataFile = 'd:/tolly/src/data/mockData.json';
let data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));

const platforms = ['Netflix', 'Amazon Prime', 'Aha', 'Disney+ Hotstar', 'Zee5', 'Theatrical'];

data.reviews = data.reviews.map((r, i) => {
  return {
    ...r,
    ottPlatform: platforms[i % platforms.length],
    ottReleaseDate: r.ottPlatform !== 'Theatrical' ? 'Streaming Now' : 'In Cinemas'
  };
});

fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf8');
console.log('OTT Data added to reviews!');
