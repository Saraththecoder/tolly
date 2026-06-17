import { Link } from 'react-router-dom';
import { Calendar, Tag } from 'lucide-react';
import { motion } from 'framer-motion';

const NewsCard = ({ article, isFeatured = false }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className={`group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 ${
        isFeatured ? 'md:flex-row md:col-span-2' : ''
      }`}
    >
      <Link 
        to={`/movie-news/${article.slug}`} 
        className={`relative overflow-hidden block ${isFeatured ? 'md:w-1/2' : 'w-full aspect-[16/10]'}`}
      >
        <img
          src={isFeatured ? article.featuredImage : article.thumbnail}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4 bg-brand-red text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
          {article.category}
        </div>
      </Link>
      
      <div className={`p-6 flex flex-col flex-grow ${isFeatured ? 'md:w-1/2 justify-center' : ''}`}>
        <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3 font-medium">
          <div className="flex items-center space-x-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{new Date(article.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          {article.tags?.[0] && (
            <div className="flex items-center space-x-1">
              <Tag className="w-3.5 h-3.5" />
              <span>{article.tags[0]}</span>
            </div>
          )}
        </div>
        
        <Link to={`/movie-news/${article.slug}`}>
          <h3 className={`font-poppins font-bold text-gray-900 group-hover:text-brand-red transition-colors mb-3 ${
            isFeatured ? 'text-2xl md:text-3xl line-clamp-3' : 'text-xl line-clamp-2'
          }`}>
            {article.title}
          </h3>
        </Link>
        
        <p className={`text-gray-600 line-clamp-3 mb-4 flex-grow text-sm ${
          isFeatured ? 'md:text-base' : ''
        }`}>
          {article.excerpt}
        </p>
        
        <div className="mt-auto pt-4 border-t border-gray-100">
          <Link 
            to={`/movie-news/${article.slug}`}
            className="text-brand-red font-semibold text-sm hover:text-red-700 transition-colors flex items-center"
          >
            Read More
            <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default NewsCard;
