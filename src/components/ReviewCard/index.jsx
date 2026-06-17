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
      className="group relative rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 bg-white border border-gray-100 flex flex-col h-full"
    >
      <Link to={`/reviews/${review.slug}`} className="block relative aspect-[2/3] overflow-hidden">
        <img 
          src={review.poster} 
          alt={review.movieName} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-900 font-bold px-2 py-1 rounded shadow-lg flex items-center space-x-1">
          <Star className="w-4 h-4 text-yellow-500 fill-current" />
          <span>{review.rating}</span>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="text-white font-poppins font-bold text-xl line-clamp-2 mb-1 drop-shadow-md">
            {review.movieName}
          </h3>
          <p className="text-gray-200 text-sm line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
            {review.snippet}
          </p>
        </div>
      </Link>
    </motion.div>
  );
};

export default ReviewCard;
