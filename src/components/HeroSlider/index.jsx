import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import { Calendar, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const HeroSlider = ({ articles }) => {
  if (!articles || articles.length === 0) return null;

  const featured = articles.slice(0, 5); // take first 5 for slider

  return (
    <div className="relative w-full h-[60vh] md:h-[70vh] rounded-2xl overflow-hidden shadow-xl mb-12 group">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop={true}
        className="w-full h-full"
      >
        {featured.map((article) => (
          <SwiperSlide key={article.id}>
            <div className="relative w-full h-full">
              <img 
                src={article.featuredImage || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80'} 
                alt={article.title} 
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80';
                }}
                className="w-full h-full object-cover"
              />
              {/* Cinematic Vignette Fade */}
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/60 to-transparent z-10" />
              
              <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 md:w-3/4 lg:w-2/3 z-20">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="bg-brand-red text-gray-100 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center shadow-[0_0_15px_rgba(255,0,0,0.6)]">
                      <span className="w-2 h-2 rounded-full bg-white mr-2 animate-pulse-glow"></span>
                      {article.category}
                    </span>
                  </div>
                  
                  <Link to={`/movie-news/${article.slug}`}>
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-poppins font-bold text-gray-100 leading-tight mb-4 hover:text-brand-red/90 transition-colors drop-shadow-lg tracking-tight">
                      {article.title}
                    </h2>
                  </Link>
                  
                  <p className="text-gray-300 text-sm md:text-lg mb-8 line-clamp-2 max-w-2xl text-shadow">
                    {article.excerpt}
                  </p>
                  
                  <Link 
                    to={`/movie-news/${article.slug}`}
                    className="inline-flex items-center bg-brand-red text-gray-100 font-bold px-8 py-4 rounded-full hover:bg-brand-red/80 transition-all shadow-[0_0_20px_rgba(255,0,0,0.5)] hover:shadow-[0_0_30px_rgba(255,0,0,0.8)] hover:-translate-y-1"
                  >
                    Read Full Story <ChevronRight className="ml-2 w-5 h-5" />
                  </Link>
                </motion.div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      
      <style jsx global>{`
        .swiper-pagination-bullet {
          background-color: white !important;
          opacity: 0.5;
        }
        .swiper-pagination-bullet-active {
          background-color: var(--color-brand-red) !important;
          opacity: 1;
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default HeroSlider;


