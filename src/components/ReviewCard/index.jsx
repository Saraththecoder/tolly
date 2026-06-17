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
      className="group relative rounded-xl overflow-hidden shadow-sm hover:shadow-[0_10px_30px_rgba(230,0,0,0.3)] transition-all duration-300 glass-card flex flex-col h-full"
    >
      <Link to={`/reviews/${review.slug}`} className="block relative aspect-[2/3] overflow-hidden">
        <img 
          src={review.poster} 
          alt={review.movieName} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/90 via-[#0A0A0A]/40 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md text-white font-bold px-3 py-1 rounded-full shadow-[0_0_10px_rgba(230,0,0,0.5)] flex items-center space-x-1 border border-white/10 group-hover:bg-brand-red transition-colors">
          <Star className="w-4 h-4 text-yellow-500 fill-current group-hover:text-white" />
          <span>{review.rating}</span>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="text-white font-poppins font-bold text-xl line-clamp-2 mb-2 drop-shadow-md group-hover:text-brand-red transition-colors">
            {review.movieName}
          </h3>
          <p className="text-gray-300 text-sm line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 mb-3">
            {review.snippet}
          </p>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200">
            <span className="text-brand-red font-bold text-sm flex items-center">
              Read Review <span className="ml-1 text-lg">→</span>
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ReviewCard;
