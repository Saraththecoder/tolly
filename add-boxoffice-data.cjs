const fs = require('fs');

const dataFile = 'd:/tolly/src/data/mockData.json';
let data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));

data.boxOffice = data.boxOffice.map(b => {
  return {
    ...b,
    dailyBreakdown: [
      { day: 'Day 1 (Friday)', indiaNet: '₹ 15.00 Cr', worldwideGross: '₹ 22.00 Cr', occupancy: '65%' },
      { day: 'Day 2 (Saturday)', indiaNet: '₹ 18.50 Cr', worldwideGross: '₹ 28.00 Cr', occupancy: '80%' },
      { day: 'Day 3 (Sunday)', indiaNet: '₹ 21.00 Cr', worldwideGross: '₹ 32.00 Cr', occupancy: '90%' },
      { day: 'Day 4 (Monday)', indiaNet: '₹ 8.00 Cr', worldwideGross: '₹ 12.00 Cr', occupancy: '40%' },
    ],
    budget: b.verdict === 'Blockbuster' ? '₹ 50 Cr' : '₹ 80 Cr',
    totalIndiaNet: '₹ 62.50 Cr',
    usPremieres: '$ 1.2M'
  };
});

fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf8');
console.log('Daily Breakdown added to Box Office!');
