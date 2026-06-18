import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

const ReviewCard = ({ review }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      className="group relative rounded-xl overflow-hidden shadow-sm hover:shadow-[0_10px_30px_rgba(255,0,0,0.3)] transition-all duration-300 glass-card flex flex-col h-full"
    >
      <Link to={`/reviews/${review.slug}`} className="block relative aspect-[2/3] overflow-hidden">
        <img 
          src={review.poster} 
          alt={review.movieName} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {/* Darker Gradient Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/60 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Subtle Glass Glare Effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none transform -translate-x-full group-hover:translate-x-full"></div>
        
        <div className="absolute top-3 right-3 bg-[#18181B] backdrop-blur-md text-gray-100 font-bold px-3 py-1 rounded-full shadow-[0_0_10px_rgba(255,0,0,0.5)] flex items-center space-x-1 border border-brand-red/10 group-hover:bg-brand-red transition-colors">
          <Star className="w-4 h-4 text-yellow-500 fill-current group-hover:text-white" />
          <span>{review.rating}</span>
        </div>

        {review.ottPlatform && review.ottPlatform !== 'Theatrical' && (
          <div className="absolute top-3 left-3 bg-brand-red text-white text-[10px] font-bold px-2 py-1 rounded shadow-[0_0_10px_rgba(255,0,0,0.5)] uppercase tracking-wider z-10">
            {review.ottPlatform}
          </div>
        )}

        <div className="absolute bottom-0 left-0 w-full p-5 transform translate-y-6 group-hover:translate-y-0 transition-transform duration-500 ease-out">
          <h3 className="text-gray-100 font-poppins font-bold text-2xl line-clamp-2 mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] group-hover:text-brand-red transition-colors">
            {review.movieName}
          </h3>
          <p className="text-gray-300 text-sm line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 mb-4 font-inter leading-relaxed">
            {review.snippet}
          </p>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
            <span className="text-gray-100 font-bold text-sm flex items-center bg-brand-red/90 w-max px-4 py-2 rounded-full shadow-[0_0_15px_rgba(255,0,0,0.4)]">
              Read Review <span className="ml-2 text-lg">â†’</span>
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ReviewCard;


