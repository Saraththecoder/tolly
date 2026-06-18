const fs = require('fs');

const dataFile = 'd:/tolly/src/data/mockData.json';
let data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));

data.galleries = [
  { id: 1, title: 'Superstar Airport Looks', image: 'https://picsum.photos/seed/gal1/600/800', photosCount: 15 },
  { id: 2, title: 'Pre-release Event Grandeur', image: 'https://picsum.photos/seed/gal2/600/800', photosCount: 42 },
  { id: 3, title: 'Actress Latest Photoshoot', image: 'https://picsum.photos/seed/gal3/600/800', photosCount: 8 },
  { id: 4, title: 'On-Sets Leaked Pictures', image: 'https://picsum.photos/seed/gal4/600/800', photosCount: 5 },
];

fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf8');
console.log('Galleries Data added!');
