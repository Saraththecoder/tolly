import { Link } from 'react-router-dom';
import { TrendingUp, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

const BoxOfficeCard = ({ boxOffice }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow border border-gray-100 overflow-hidden flex flex-col sm:flex-row group"
    >
      <Link to={`/box-office/${boxOffice.slug}`} className="w-full h-64 sm:h-auto sm:w-1/3 relative overflow-hidden shrink-0">
        <img 
          src={boxOffice.poster} 
          alt={boxOffice.movieName} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className={`absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded text-white shadow ${
          boxOffice.verdict === 'Blockbuster' ? 'bg-red-600' : 'bg-green-600'
        }`}>
          {boxOffice.verdict}
        </div>
      </Link>

      <div className="p-5 flex flex-col justify-between flex-grow">
        <div>
          <Link to={`/box-office/${boxOffice.slug}`}>
            <h3 className="text-xl font-poppins font-bold text-gray-900 group-hover:text-brand-red transition-colors mb-3 line-clamp-2">
              {boxOffice.movieName}
            </h3>
          </Link>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
              <div className="flex items-center text-sm text-gray-600">
                <TrendingUp className="w-4 h-4 mr-2 text-brand-red" />
                <span>Day Collection</span>
              </div>
              <span className="font-bold text-gray-900">{boxOffice.dayCollection}</span>
            </div>
            <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
              <div className="flex items-center text-sm text-gray-600">
                <Globe className="w-4 h-4 mr-2 text-blue-600" />
                <span>Worldwide Gross</span>
              </div>
              <span className="font-bold text-gray-900">{boxOffice.worldwideGross}</span>
            </div>
          </div>
        </div>

        <Link 
          to={`/box-office/${boxOffice.slug}`}
          className="w-full text-center py-2 bg-gray-100 hover:bg-brand-red hover:text-white text-gray-800 font-semibold rounded transition-colors text-sm"
        >
          View Full Details
        </Link>
      </div>
    </motion.div>
  );
};

export default BoxOfficeCard;
