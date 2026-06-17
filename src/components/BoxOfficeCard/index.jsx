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
      className="glass-card rounded-xl hover:shadow-[0_10px_30px_rgba(230,0,0,0.3)] transition-all duration-300 overflow-hidden flex flex-col sm:flex-row group border border-white/10"
    >
      <Link to={`/box-office/${boxOffice.slug}`} className="w-full h-64 sm:h-auto sm:w-1/3 relative overflow-hidden shrink-0">
        <img 
          src={boxOffice.poster} 
          alt={boxOffice.movieName} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className={`absolute top-2 left-2 text-xs font-bold px-3 py-1 rounded-full text-white shadow-lg border ${
          boxOffice.verdict === 'Blockbuster' ? 'bg-red-600/90 border-red-400 shadow-[0_0_15px_rgba(220,38,38,0.8)]' : 'bg-green-600/90 border-green-400 shadow-[0_0_15px_rgba(22,163,74,0.8)]'
        }`}>
          {boxOffice.verdict}
        </div>
      </Link>

      <div className="p-5 flex flex-col justify-between flex-grow">
        <div>
          <Link to={`/box-office/${boxOffice.slug}`}>
            <h3 className="text-xl font-poppins font-bold text-white group-hover:text-brand-red transition-colors mb-3 line-clamp-2">
              {boxOffice.movieName}
            </h3>
          </Link>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between items-center bg-black/40 border border-white/5 p-2.5 rounded-lg">
              <div className="flex items-center text-sm text-gray-400">
                <TrendingUp className="w-4 h-4 mr-2 text-brand-red" />
                <span>Day Collection</span>
              </div>
              <span className="font-bold text-white tracking-wider">{boxOffice.dayCollection}</span>
            </div>
            <div className="flex justify-between items-center bg-black/40 border border-white/5 p-2.5 rounded-lg">
              <div className="flex items-center text-sm text-gray-400">
                <Globe className="w-4 h-4 mr-2 text-blue-400" />
                <span>Worldwide Gross</span>
              </div>
              <span className="font-bold text-white tracking-wider">{boxOffice.worldwideGross}</span>
            </div>
          </div>
        </div>

        <Link 
          to={`/box-office/${boxOffice.slug}`}
          className="w-full text-center py-2.5 bg-brand-red/10 border border-brand-red/30 hover:bg-brand-red hover:shadow-[0_0_15px_rgba(230,0,0,0.5)] text-brand-red hover:text-white font-semibold rounded transition-all duration-300 text-sm tracking-wide"
        >
          View Full Details
        </Link>
      </div>
    </motion.div>
  );
};

export default BoxOfficeCard;
