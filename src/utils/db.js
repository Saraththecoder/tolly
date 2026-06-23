import mockData from '../data/mockData.json';

const DB_KEY = 'tolly_db';

const defaultSchedules = [
  { id: 1, movieName: "Nagabandham", releaseDate: "2026-06-27", language: "Telugu", status: "Confirmed" },
  { id: 2, movieName: "Raghuvaran B.Tech", releaseDate: "2026-07-04", language: "Re-Release", status: "Confirmed" },
  { id: 3, movieName: "Vishwambhara", releaseDate: "2026-10-15", language: "Telugu", status: "TBA" },
  { id: 4, movieName: "Aadarsha Kutumbam", releaseDate: "2027-04-10", language: "Telugu", status: "TBA" }
];

const defaultNorthAmerica = [
  {
    id: 1,
    movieName: "Peddi",
    hourlyGross: "$185K",
    totalGross: "$3.45M",
    premierGross: "$1.12M",
    screens: "480",
    status: "Active",
    lastUpdated: "10 Mins ago",
    poster: "https://images.unsplash.com/photo-1508847154043-be12a62861c1?auto=format&fit=crop&w=300&h=450&q=80"
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
    poster: "https://images.unsplash.com/photo-1524712245354-2c4e5e7124c5?auto=format&fit=crop&w=300&h=450&q=80"
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
    poster: "https://images.unsplash.com/photo-1535016120720-40c646be5580?auto=format&fit=crop&w=300&h=450&q=80"
  }
];

const defaultPopupAd = {
  active: true,
  title: "ChitramBhalare Exclusive: Mega Blockbuster Peddi Success Meet Live Stream at 6:00 PM!",
  imageUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80",
  linkUrl: "/movie-news/peddi-crosses-320-cr-worldwide-in-2-weeks-telugu-dominates",
  buttonText: "Watch Success Meet"
};

const defaultTop5 = [
  { rank: 1, movieName: "Peddi", gross: "₹320 Cr", verdict: "Blockbuster", trend: "▲ Strong" },
  { rank: 2, movieName: "Drishyam 3", gross: "₹236 Cr", verdict: "Hit", trend: "▼ Slowing" },
  { rank: 3, movieName: "Obsession", gross: "₹84.9 Cr", verdict: "Hit", trend: "▼ Declining" },
  { rank: 4, movieName: "Hai Jawani Toh Ishq", gross: "₹55.2 Cr", verdict: "Average", trend: "▼ Low" },
  { rank: 5, movieName: "Maa Inti Bangaaram", gross: "TBA", verdict: "New", trend: "▲ Awaited" }
];

export const initDb = () => {
  if (typeof window === 'undefined') return;
  const stored = localStorage.getItem(DB_KEY);
  if (!stored) {
    const initialData = {
      ...mockData,
      upcomingSchedules: defaultSchedules,
      northAmericaCollections: defaultNorthAmerica,
      popupAd: defaultPopupAd,
      boxOfficeTop5: defaultTop5
    };
    localStorage.setItem(DB_KEY, JSON.stringify(initialData));
  }
};

export const getDb = () => {
  initDb();
  if (typeof window === 'undefined') return mockData;
  try {
    return JSON.parse(localStorage.getItem(DB_KEY)) || mockData;
  } catch (e) {
    return mockData;
  }
};

export const saveDb = (data) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DB_KEY, JSON.stringify(data));
  // Dispatch a custom event to notify components of changes in real-time
  window.dispatchEvent(new Event('tolly_db_change'));
};

export const resetDb = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(DB_KEY);
  initDb();
  window.dispatchEvent(new Event('tolly_db_change'));
};
