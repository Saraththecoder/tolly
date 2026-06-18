import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

const flashNewsData = [
  { id: 1, text: 'Breaking: Massive Pre-release Event Planned for Project X in Dubai!', link: '/movie-news/project-x-dubai' },
  { id: 2, text: 'Box Office: Latest Blockbuster crosses 100 Crore mark worldwide in 3 days.', link: '/box-office/latest-blockbuster' },
  { id: 3, text: 'OTT Update: Superstar\'s action thriller to stream from this Friday.', link: '/movie-news/ott-release-update' },
  { id: 4, text: 'Exclusive Interview: Director reveals sequel plans for hit franchise.', link: '/movie-news/director-interview' },
];

const FlashNews = () => {
  return (
    <div className="bg-brand-red text-white text-sm font-semibold overflow-hidden flex items-center h-10 shadow-lg relative z-[60]">
      <div className="bg-[#110000] px-4 h-full flex items-center justify-center shrink-0 z-10 border-r border-brand-red/50 shadow-[5px_0_15px_rgba(0,0,0,0.5)]">
        <Zap className="w-4 h-4 text-brand-red mr-2 fill-current animate-pulse" />
        <span className="uppercase tracking-wider">Flash News</span>
      </div>
      
      <div className="flex-1 overflow-hidden relative h-full flex items-center">
        <div className="animate-marquee whitespace-nowrap flex space-x-12">
          {/* Double the array for seamless looping */}
          {[...flashNewsData, ...flashNewsData].map((news, index) => (
            <Link 
              key={`${news.id}-${index}`} 
              to={news.link}
              className="hover:text-black transition-colors inline-block"
            >
              • {news.text}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FlashNews;
