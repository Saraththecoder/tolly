import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import { Calendar } from 'lucide-react';
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
                src={article.featuredImage} 
                alt={article.title} 
                className="w-full h-full object-cover"
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/90 via-brand-dark/40 to-transparent"></div>
              
              <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 md:w-3/4 lg:w-2/3">
                <div className="mb-4 flex items-center space-x-3">
                  <span className="bg-brand-red text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {article.category}
                  </span>
                  <div className="flex items-center text-gray-300 text-sm font-medium">
                    <Calendar className="w-4 h-4 mr-1.5" />
                    {new Date(article.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
                
                <Link to={`/movie-news/${article.slug}`}>
                  <h2 className="text-3xl md:text-5xl font-poppins font-bold text-white leading-tight mb-4 hover:text-brand-red transition-colors line-clamp-2">
                    {article.title}
                  </h2>
                </Link>
                
                <p className="text-gray-200 text-base md:text-lg line-clamp-2 mb-6 max-w-3xl">
                  {article.excerpt}
                </p>
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
      `}</style>
    </div>
  );
};

export default HeroSlider;
