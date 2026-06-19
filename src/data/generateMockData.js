import fs from 'fs';
import path from 'path';

const categories = ['Tollywood', 'Bollywood', 'Hollywood', 'OTT', 'Interviews', 'Gossips', 'Production', 'Casting', 'Release Date', 'Re-Release', 'Event'];
const ottPlatforms = ['Netflix', 'Amazon Prime', 'Aha', 'Disney+ Hotstar', 'Zee5', 'Theatrical'];

// Specific news articles matching the mockup content
const specificArticles = [
  {
    id: 1,
    slug: "chiranjeevi-venkatesh-rumors-films-not-postponed",
    title: "Chiranjeevi & Venkatesh Rumors: Films Not Postponed",
    excerpt: "Rumors about Vishwambhara and Aadarsha Kutumbam release changes denied by production houses. Both films on track.",
    content: [
      { type: "paragraph", value: "Rumors have been circulating in Tollywood that megastar Chiranjeevi's visual wonder Vishwambhara and Venkatesh's family drama Aadarsha Kutumbam have been pushed to later dates. However, production houses UV Creations and Mythri Movie Makers have officially denied these reports." },
      { type: "image", value: "https://picsum.photos/seed/vishwambhara/800/400" },
      { type: "paragraph", value: "Vishwambhara is a high-budget fantasy adventure directed by Vassishta, and the talk is that the visual effects are turning out to be top-tier. Aadarsha Kutumbam is a family emotional entertainer being directed by Sailesh Kolanu." },
      { type: "paragraph", value: "Both films are key releases for the upcoming season, and trade analysts suggest they will have a massive opening. The production houses confirmed that shooting is progressing as scheduled and requested fans not to believe false speculations." }
    ],
    thumbnail: "https://picsum.photos/seed/news1_thumb/400/250",
    featuredImage: "https://picsum.photos/seed/news1_feat/1200/600",
    date: "2026-06-18T12:00:00.000Z",
    category: "Production",
    author: "Aditya",
    tags: ["Trending", "Production", "Chiranjeevi", "Venkatesh"]
  },
  {
    id: 2,
    slug: "dhurandhar-unedited-version-streams-on-netflix-june-19",
    title: "Dhurandhar Unedited Version Streams on Netflix June 19",
    excerpt: "The raw and uncut version of the action thriller Dhurandhar is set for its digital premiere on Netflix.",
    content: [
      { type: "paragraph", value: "Fans of raw action cinema have a reason to celebrate. The unedited version of the hit movie Dhurandhar will stream on Netflix starting June 19, 2026." },
      { type: "image", value: "https://picsum.photos/seed/dhurandhar/800/400" },
      { type: "paragraph", value: "The film originally faced multiple cuts from the censor board for its theatrical release due to intense violence. The digital release promises to show the director's original vision uncut." }
    ],
    thumbnail: "https://picsum.photos/seed/dhurandhar_thumb/400/250",
    featuredImage: "https://picsum.photos/seed/dhurandhar_feat/1200/600",
    date: "2026-06-18T11:00:00.000Z",
    category: "OTT",
    author: "Aditya",
    tags: ["OTT", "Netflix", "Trending"]
  },
  {
    id: 3,
    slug: "preity-mukhundhan-signed-for-sharwanands-telugu-film",
    title: "Preity Mukhundhan Signed for Sharwanand's Telugu Film",
    excerpt: "Preity Mukhundhan joins the cast of Sharwanand's next romantic entertainer as the female lead.",
    content: [
      { type: "paragraph", value: "Talented actress Preity Mukhundhan has officially been signed as the female lead in actor Sharwanand's upcoming Telugu film. The movie is described as a soulful romantic entertainer." }
    ],
    thumbnail: "https://picsum.photos/seed/preity_thumb/400/250",
    featuredImage: "https://picsum.photos/seed/preity_feat/1200/600",
    date: "2026-06-18T10:00:00.000Z",
    category: "Casting",
    author: "Aditya",
    tags: ["Casting", "Sharwanand", "Tollywood"]
  },
  {
    id: 4,
    slug: "kannappa-re-release-manchu-vishnu-returns-june-27",
    title: "Kannappa Re-Release: Manchu Vishnu Returns June 27",
    excerpt: "The historical epic drama Kannappa starring Manchu Vishnu is scheduled to hit the screens again with a remastered version.",
    content: [
      { type: "paragraph", value: "Actor-producer Manchu Vishnu's magnum opus Kannappa is getting a remastered theatrical re-release on June 27, 2026, featuring upgraded VFX and immersive Dolby Atmos audio." }
    ],
    thumbnail: "https://picsum.photos/seed/kannappa_thumb/400/250",
    featuredImage: "https://picsum.photos/seed/kannappa_feat/1200/600",
    date: "2026-06-18T09:00:00.000Z",
    category: "Re-Release",
    author: "Aditya",
    tags: ["Re-Release", "Kannappa", "Manchu Vishnu"]
  },
  {
    id: 5,
    slug: "aadarsha-kutumbam-pushed-to-summer-2027",
    title: "Aadarsha Kutumbam Pushed to Summer 2027?",
    excerpt: "Rumors fly as speculations rise that Venkatesh's emotional family drama Aadarsha Kutumbam might move to next year.",
    content: [
      { type: "paragraph", value: "While production houses have denied postponements, trade circles are full of speculations that Venkatesh's upcoming emotional drama Aadarsha Kutumbam might target a Summer 2027 slot for maximum reach." }
    ],
    thumbnail: "https://picsum.photos/seed/aadarsha_thumb/400/250",
    featuredImage: "https://picsum.photos/seed/aadarsha_feat/1200/600",
    date: "2026-06-18T08:00:00.000Z",
    category: "Release Date",
    author: "Aditya",
    tags: ["Release Date", "Venkatesh", "Tollywood"]
  },
  {
    id: 6,
    slug: "sharwanand-sreenu-vaitla-anil-sunkara-replaces-mythri",
    title: "Sharwanand–Sreenu Vaitla: Anil Sunkara Replaces Mythri",
    excerpt: "A major producer shuffle takes place for Sharwanand's collaboration with director Sreenu Vaitla.",
    content: [
      { type: "paragraph", value: "In a surprising development, AK Entertainments' Anil Sunkara has stepped in to produce director Sreenu Vaitla's next film with Sharwanand, replacing Mythri Movie Makers." }
    ],
    thumbnail: "https://picsum.photos/seed/sunkara_thumb/400/250",
    featuredImage: "https://picsum.photos/seed/sunkara_feat/1200/600",
    date: "2026-06-17T18:00:00.000Z",
    category: "Production",
    author: "Aditya",
    tags: ["Production", "Sreenu Vaitla", "Sharwanand"]
  },
  {
    id: 7,
    slug: "raghuvaran-btech-returns-to-theatres-july-4",
    title: "Raghuvaran B.Tech Returns to Theatres July 4",
    excerpt: "Dhanush's iconic cult hit blockbustter Raghuvaran B.Tech is set for a grand Telugu states re-release.",
    content: [
      { type: "paragraph", value: "Dhanush's massive blockbustter VIP, dubbed in Telugu as Raghuvaran B.Tech, is re-releasing in theatres on July 4, 2026. Theater bookings are expected to open soon." }
    ],
    thumbnail: "https://picsum.photos/seed/raghuvaran_thumb/400/250",
    featuredImage: "https://picsum.photos/seed/raghuvaran_feat/1200/600",
    date: "2026-06-17T17:00:00.000Z",
    category: "Re-Release",
    author: "Aditya",
    tags: ["Re-Release", "Dhanush", "Cult Classic"]
  },
  {
    id: 8,
    slug: "drishyam-3-faces-last-minute-ott-setback",
    title: "Drishyam 3 Faces Last-Minute OTT Setback",
    excerpt: "Amazon Prime Video faces licensing hurdles for Mohanlal's blockbuster thriller sequel.",
    content: [
      { type: "paragraph", value: "Mohanlal's highly anticipated crime thriller sequel Drishyam 3 has run into some licensing issues with Amazon Prime Video, slightly delaying its streaming launch." }
    ],
    thumbnail: "https://picsum.photos/seed/drishyam_thumb/400/250",
    featuredImage: "https://picsum.photos/seed/drishyam_feat/1200/600",
    date: "2026-06-17T16:00:00.000Z",
    category: "OTT",
    author: "Aditya",
    tags: ["OTT", "Drishyam 3", "Mohanlal"]
  },
  {
    id: 9,
    slug: "venkatesh-kalyan-ram-film-female-leads-announced",
    title: "Venkatesh Kalyan Ram Film Female Leads Announced",
    excerpt: "The makers of Venkatesh and Kalyan Ram's multi-starrer announce their lead heroines.",
    content: [
      { type: "paragraph", value: "The production house officially revealed the female leads for the upcoming multi-starrer movie starring Venkatesh and Nandamuri Kalyan Ram." }
    ],
    thumbnail: "https://picsum.photos/seed/multistarrer_thumb/400/250",
    featuredImage: "https://picsum.photos/seed/multistarrer_feat/1200/600",
    date: "2026-06-18T05:00:00.000Z",
    category: "Casting",
    author: "Aditya",
    tags: ["Casting", "Venkatesh", "Kalyan Ram"]
  },
  {
    id: 10,
    slug: "vishwambhara-release-date-confusion-continues",
    title: "Vishwambhara Release Date Confusion Continues",
    excerpt: "Speculations regarding Megastar Chiranjeevi's high-budget fantasy film release date keep fans guessing.",
    content: [
      { type: "paragraph", value: "Confusion surrounding the exact release window of Chiranjeevi's visual feast Vishwambhara persists as rumors of reshoots and VFX delays float in film circles." }
    ],
    thumbnail: "https://picsum.photos/seed/vishwambhara2_thumb/400/250",
    featuredImage: "https://picsum.photos/seed/vishwambhara2_feat/1200/600",
    date: "2026-06-17T14:00:00.000Z",
    category: "Production",
    author: "Aditya",
    tags: ["Production", "Chiranjeevi", "Release Date"]
  },
  {
    id: 11,
    slug: "hrithik-roshans-jailer-2-cameo-shoot-begins",
    title: "Hrithik Roshan's Jailer 2 Cameo Shoot Begins",
    excerpt: "Bollywood superstar Hrithik Roshan joins Rajinikanth on the sets of Jailer 2 in Hyderabad.",
    content: [
      { type: "paragraph", value: "Hrithik Roshan has arrived in Hyderabad to shoot his highly secret cameo role in Superstar Rajinikanth's high-octane sequel Jailer 2, directed by Nelson Dilipkumar." }
    ],
    thumbnail: "https://picsum.photos/seed/jailer_thumb/400/250",
    featuredImage: "https://picsum.photos/seed/jailer_feat/1200/600",
    date: "2026-06-17T13:00:00.000Z",
    category: "Bollywood",
    author: "Aditya",
    tags: ["Bollywood", "Rajinikanth", "Hrithik Roshan"]
  },
  {
    id: 12,
    slug: "nagabandham-trailer-to-launch-at-prasads-pcx",
    title: "Nagabandham Trailer to Launch at Prasads PCX",
    excerpt: "The trailer of the mythological adventure fantasy film Nagabandham is set to debut at Prasad PCX IMAX.",
    content: [
      { type: "paragraph", value: "The official trailer of the visual wonder Nagabandham will be launched in a grand event at Prasads PCX screen, Hyderabad, on June 19, 2026." }
    ],
    thumbnail: "https://picsum.photos/seed/nagabandham_thumb/400/250",
    featuredImage: "https://picsum.photos/seed/nagabandham_feat/1200/600",
    date: "2026-06-17T12:00:00.000Z",
    category: "Event",
    author: "Aditya",
    tags: ["Event", "Trailer Launch", "Nagabandham"]
  },
  // Peddi single article detail
  {
    id: 13,
    slug: "peddi-crosses-320-cr-worldwide-in-2-weeks-telugu-dominates",
    title: "Peddi Crosses ₹320 Cr Worldwide in 2 Weeks; Telugu Dominates",
    excerpt: "Ram Charan's sports drama continues its record-breaking run, cementing its place among the biggest Telugu hits of the decade.",
    content: [
      { type: "paragraph", value: "Ram Charan's sports action drama Peddi has crossed the ₹320 Crore mark in worldwide gross collections within two weeks of its theatrical release, emerging as one of the fastest Telugu films to achieve this milestone. Directed by Buchi Babu Sana, the film has delivered a dominant run at the Telugu box office with collections showing strong hold even in the second week." },
      { type: "paragraph", value: "The film opened to massive numbers on Day 1, recording the biggest opening in the Telugu states for a sports drama. The first week closed at approximately ₹252 Cr worldwide, while the second week added a further ₹68+ Cr, taking the running total past ₹320 Cr by Day 14." },
      { type: "paragraph", value: "At ₹320 Cr in two weeks, Peddi has already surpassed the lifetime collections of several major Telugu blockbusters. It now sits within striking distance of the ₹350 Cr club, a territory only RRR, Baahubali 2, and Pushpa 2 have entered in Telugu cinema history." },
      { type: "paragraph", value: "The film's performance in the AP/TS circuits has been particularly noteworthy. The Telugu share from the home circuits alone is estimated at over ₹195 Cr, making it one of the highest-grossing Telugu-language films in its home territory within the first fortnight." },
      { type: "paragraph", value: "The overseas market has contributed meaningfully — with the USA, Australia, and the Middle East being the top territories. The global reach reflects Ram Charan's rising worldwide fanbase following the international success of RRR." },
      { type: "paragraph", value: "With a new director's cut version rolling out in theatres — featuring added scenes and an improved audio mix — the film is expected to see a bump heading into the third weekend. Trade analysts project a ₹380–₹400 Cr worldwide closing gross if the hold continues at this pace." }
    ],
    thumbnail: "https://picsum.photos/seed/peddi_thumb/400/250",
    featuredImage: "https://picsum.photos/seed/peddi_feat/1200/600",
    date: "2026-06-18T15:25:38.000Z",
    category: "Box Office",
    author: "Aditya",
    tags: ["Ram Charan", "Peddi", "Box Office", "Buchi Babu Sana", "Telugu Cinema", "300 Cr Club"]
  }
];

// Generate extra articles for each alphabet letter to keep the Archive directory fully operational
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const extraArticles = [];
let idCounter = 20;

alphabet.forEach(letter => {
  for (let i = 1; i <= 4; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    extraArticles.push({
      id: idCounter,
      slug: `extra-article-letter-${letter}-${i}`,
      title: `${letter}${Math.random().toString(36).substring(2, 6).toUpperCase()} - Tollywood Updates & News`,
      excerpt: `Check out our analysis and quick news notes for the letter ${letter} film projects currently under development in Tollywood.`,
      content: [
        { type: "paragraph", value: `This is a quick summary paragraph for our special database listing starting with the letter ${letter}.` },
        { type: "paragraph", value: "Production schedules, music releases, and casting announcements are all being lined up as we speak." }
      ],
      thumbnail: `https://picsum.photos/seed/extra_${idCounter}/400/250`,
      featuredImage: `https://picsum.photos/seed/extra_feat_${idCounter}/1200/600`,
      date: new Date(Date.now() - Math.floor(Math.random() * 2000000000)).toISOString(),
      category: category,
      author: `Aditya`,
      tags: ["Update", "Tollywood"]
    });
    idCounter++;
  }
});

const articles = [...specificArticles, ...extraArticles];

// Seeding Reviews
const reviews = [
  {
    id: 1,
    slug: "peddi-review",
    movieName: "Peddi",
    poster: "https://picsum.photos/seed/peddipost/300/450",
    rating: "4.5",
    snippet: "Ram Charan delivers an award-worthy performance in this gripping emotional sports drama.",
    story: "A determined athlete fights systemic hurdles and personal demons to win gold for his state, guided by a passionate mentor.",
    performances: "Ram Charan is outstanding, showcasing extreme physical transformation and deep emotional range. Buchi Babu Sana's writing and direction are first class.",
    technicalAspects: "A.R. Rahman's background score is phenomenal, raising the tension. Cinematography by mock-crew is brilliant.",
    verdict: "Blockbuster sports drama that should not be missed.",
    ottPlatform: "Theatrical",
    ottReleaseDate: "In Cinemas Now",
    date: "2026-06-04T12:00:00.000Z"
  },
  {
    id: 2,
    slug: "drishyam-3-review",
    movieName: "Drishyam 3",
    poster: "https://picsum.photos/seed/drish3post/300/450",
    rating: "4.0",
    snippet: "Mohanlal and Jeethu Joseph return with a mind-bending climax that matches the legacy of the previous parts.",
    story: "Georgekutty faces his toughest test as local police discover fresh forensic evidence and plan a final trap for his family.",
    performances: "Mohanlal plays Georgekutty with a calm, genius composure. Jeethu Joseph delivers another tightly-knit thriller script.",
    technicalAspects: "Suspenseful background tracks and crisp, fast editing keep the pacing absolutely tight.",
    verdict: "A superb continuation that satisfies suspense lovers.",
    ottPlatform: "Amazon Prime",
    ottReleaseDate: "June 17, 2026",
    date: "2026-06-17T12:00:00.000Z"
  },
  {
    id: 3,
    slug: "obsession-review",
    movieName: "Obsession",
    poster: "https://picsum.photos/seed/obsesspost/300/450",
    rating: "3.8",
    snippet: "Vijay Sethupathi and Atlee team up for a sleek, high-octane romantic action thriller.",
    story: "A brilliant investigator meets his match in a mastermind criminal who seems to know his past.",
    performances: "Vijay Sethupathi plays the lead character with his trademark swag and humor. Atlee's styling is gorgeous.",
    technicalAspects: "Visually vibrant colors, grand dance numbers, and massive sets.",
    verdict: "Sleek commercial entertainer that works well.",
    ottPlatform: "Theatrical",
    ottReleaseDate: "In Cinemas Now",
    date: "2026-05-30T12:00:00.000Z"
  },
  {
    id: 4,
    slug: "karuppu-review",
    movieName: "Karuppu",
    poster: "https://picsum.photos/seed/karuppupost/300/450",
    rating: "4.2",
    snippet: "Suriya delivers a powerful performance in this dark, gritty action-packed drama.",
    story: "A reformist rises from the shadows of an underbelly community to fight against local land mafias.",
    performances: "Suriya is intense and carries the film single-handedly. Supporting cast is incredibly natural.",
    technicalAspects: "Gothic cinematography, heavy bass soundtracks, and intense action sequences.",
    verdict: "Gritty, engaging action film with a strong message.",
    ottPlatform: "Theatrical",
    ottReleaseDate: "In Cinemas Now",
    date: "2026-05-19T12:00:00.000Z"
  }
];

// Seeding Box Office Data
const boxOffice = [
  {
    id: 1,
    slug: "peddi-box-office",
    movieName: "Peddi",
    director: "Buchi Babu Sana",
    cast: "Ram Charan, Janhvi Kapoor",
    poster: "https://picsum.photos/seed/peddibox/300/450",
    dayCollection: "₹18 Cr",
    worldwideGross: "₹320 Cr",
    indiaNet: "₹195 Cr",
    indiaGross: "₹240 Cr",
    overseas: "₹80 Cr",
    verdict: "Blockbuster",
    trend: "▲ Strong",
    days: "14",
    languages: "Telugu, Hindi, Tamil",
    percentage: 88,
    date: "2026-06-18T23:45:00.000Z"
  },
  {
    id: 2,
    slug: "drishyam-3-box-office",
    movieName: "Drishyam 3",
    director: "Jeethu Joseph",
    cast: "Mohanlal, Meena",
    poster: "https://picsum.photos/seed/drishyam3box/300/450",
    dayCollection: "₹3.5 Cr",
    worldwideGross: "₹236 Cr",
    indiaNet: "₹142 Cr",
    indiaGross: "₹182 Cr",
    overseas: "₹54 Cr",
    verdict: "Hit",
    trend: "▼ Slowing",
    days: "24",
    languages: "Malayalam, Tamil",
    percentage: 65,
    date: "2026-06-18T23:45:00.000Z"
  },
  {
    id: 3,
    slug: "obsession-box-office",
    movieName: "Obsession",
    director: "Atlee",
    cast: "Vijay Sethupathi, Nayanthara",
    poster: "https://picsum.photos/seed/obsbox/300/450",
    dayCollection: "₹2.1 Cr",
    worldwideGross: "₹84.9 Cr",
    indiaNet: "₹51.2 Cr",
    indiaGross: "₹64.9 Cr",
    overseas: "₹20 Cr",
    verdict: "Hit",
    trend: "▼ Declining",
    days: "18",
    languages: "Tamil, Telugu, Hindi",
    percentage: 38,
    date: "2026-06-18T23:45:00.000Z"
  },
  {
    id: 4,
    slug: "hai-jawani-toh-ishq-box-office",
    movieName: "Hai Jawani Toh Ishq",
    director: "Karan Johar",
    cast: "Saif Ali Khan, Ibrahim Ali Khan",
    poster: "https://picsum.photos/seed/jawani/300/450",
    dayCollection: "₹1.2 Cr",
    worldwideGross: "₹55.2 Cr",
    indiaNet: "₹34.5 Cr",
    indiaGross: "₹45.2 Cr",
    overseas: "₹10 Cr",
    verdict: "Average",
    trend: "▼ Low",
    days: "21",
    languages: "Hindi",
    percentage: 30,
    date: "2026-06-18T23:45:00.000Z"
  },
  {
    id: 5,
    slug: "maa-inti-bangaaram-box-office",
    movieName: "Maa Inti Bangaaram",
    director: "Suresh P",
    cast: "Nithya Menen, Sharwanand",
    poster: "https://picsum.photos/seed/bangaaram/300/450",
    dayCollection: "TBA",
    worldwideGross: "TBA",
    indiaNet: "—",
    indiaGross: "—",
    overseas: "—",
    verdict: "New",
    trend: "▲ Awaited",
    days: "1",
    languages: "Telugu",
    percentage: 5,
    date: "2026-06-18T23:45:00.000Z"
  },
  {
    id: 6,
    slug: "disclosure-day-box-office",
    movieName: "Disclosure Day",
    director: "Vidyut Jammwal",
    cast: "Vidyut Jammwal",
    poster: "https://picsum.photos/seed/disclosure/300/450",
    dayCollection: "₹0.4 Cr",
    worldwideGross: "₹9.5 Cr",
    indiaNet: "₹6.1 Cr",
    indiaGross: "₹7.5 Cr",
    overseas: "₹2 Cr",
    verdict: "Flop",
    trend: "▼ Closing",
    days: "10",
    languages: "Hindi, Telugu",
    percentage: 18,
    date: "2026-06-18T23:45:00.000Z"
  },
  {
    id: 7,
    slug: "sing-geetham-box-office",
    movieName: "Sing Geetham",
    director: "Singeetham Srinivasa Rao",
    cast: "Various",
    poster: "https://picsum.photos/seed/singeet/300/450",
    dayCollection: "₹0.1 Cr",
    worldwideGross: "₹5.0 Cr",
    indiaNet: "₹3.2 Cr",
    indiaGross: "₹4.0 Cr",
    overseas: "₹1.0 Cr",
    verdict: "Flop",
    trend: "▼ Closing",
    days: "14",
    languages: "Telugu",
    percentage: 12,
    date: "2026-06-18T23:45:00.000Z"
  },
  {
    id: 8,
    slug: "mollywood-times-box-office",
    movieName: "Mollywood Times",
    director: "Joshiy",
    cast: "Mammootty",
    poster: "https://picsum.photos/seed/moll/300/450",
    dayCollection: "₹0.6 Cr",
    worldwideGross: "₹9.5 Cr",
    indiaNet: "₹5.8 Cr",
    indiaGross: "₹7.5 Cr",
    overseas: "₹2.0 Cr",
    verdict: "Running",
    trend: "▲ Steady",
    days: "11",
    languages: "Malayalam",
    percentage: 15,
    date: "2026-06-18T23:45:00.000Z"
  }
];

// Seeding Stills Galleries
const galleries = [
  {
    id: 1,
    title: "Peddi Set Stills",
    coverImage: "https://picsum.photos/seed/peddigal/600/400",
    images: [
      { url: "https://picsum.photos/seed/peddig1/800/600", caption: "Ram Charan in action workout" },
      { url: "https://picsum.photos/seed/peddig2/800/600", caption: "Buchi Babu Sana framing the shot" }
    ],
    date: "2026-06-18T23:45:00.000Z"
  },
  {
    id: 2,
    title: "Vishwambhara VFX Behind the Scenes",
    coverImage: "https://picsum.photos/seed/visgal/600/400",
    images: [
      { url: "https://picsum.photos/seed/visg1/800/600", caption: "Chiranjeevi fantasy sequence" },
      { url: "https://picsum.photos/seed/visg2/800/600", caption: "Chroma setup details" }
    ],
    date: "2026-06-17T23:45:00.000Z"
  }
];

const mockData = {
  articles,
  reviews,
  boxOffice,
  galleries
};

const outputPath = path.join(process.cwd(), 'src', 'data', 'mockData.json');
fs.writeFileSync(outputPath, JSON.stringify(mockData, null, 2));
console.log(`Pristine realistic mock database generated at ${outputPath}`);
