import { Link } from 'react-router-dom';
import { TrendingUp, Globe, MapPin, IndianRupee, Plane } from 'lucide-react';
import { motion } from 'framer-motion';

const BoxOfficeCard = ({ boxOffice }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="glass-card rounded-xl hover:shadow-[0_10px_30px_rgba(255,0,0,0.3)] transition-all duration-300 overflow-hidden flex flex-col sm:flex-row group border border-brand-red/10"
    >
      <Link to={`/box-office/${boxOffice.slug}`} className="w-full h-64 sm:h-auto sm:w-1/3 relative overflow-hidden shrink-0">
        <img 
          src={boxOffice.poster || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80'} 
          alt={boxOffice.movieName} 
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80';
          }}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className={`absolute top-2 left-2 text-xs font-bold px-3 py-1 rounded-full text-gray-100 shadow-lg border ${
          boxOffice.verdict === 'Blockbuster' ? 'bg-red-600/90 border-red-400 shadow-[0_0_15px_rgba(220,38,38,0.8)]' : 'bg-green-600/90 border-green-400 shadow-[0_0_15px_rgba(22,163,74,0.8)]'
        }`}>
          {boxOffice.verdict}
        </div>
      </Link>

      <div className="p-5 flex flex-col justify-between flex-grow">
        <div>
          <Link to={`/box-office/${boxOffice.slug}`}>
            <h3 className="text-xl font-poppins font-bold text-gray-100 group-hover:text-brand-red transition-colors mb-3 line-clamp-2">
              {boxOffice.movieName}
            </h3>
          </Link>
          
          <div className="grid grid-cols-1 gap-2 mb-4">
            <div className="flex justify-between items-center bg-brand-red/10 border border-brand-red/20 p-2.5 rounded-lg shadow-inner">
              <div className="flex items-center text-sm font-semibold text-brand-red">
                <TrendingUp className="w-4 h-4 mr-2" />
                <span>Day Collection</span>
              </div>
              <span className="font-bold text-white tracking-wider drop-shadow-md">{boxOffice.dayCollection}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-1">
              <div className="flex flex-col justify-center bg-[#18181B] border border-gray-800 p-2.5 rounded-lg">
                <div className="flex items-center text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                  <IndianRupee className="w-3 h-3 mr-1 text-green-400" />
                  <span>India Net</span>
                </div>
                <span className="font-bold text-gray-100 text-sm">{boxOffice.indiaNet}</span>
              </div>
              <div className="flex flex-col justify-center bg-[#18181B] border border-gray-800 p-2.5 rounded-lg">
                <div className="flex items-center text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                  <MapPin className="w-3 h-3 mr-1 text-blue-400" />
                  <span>India Gross</span>
                </div>
                <span className="font-bold text-gray-100 text-sm">{boxOffice.indiaGross}</span>
              </div>
              <div className="flex flex-col justify-center bg-[#18181B] border border-gray-800 p-2.5 rounded-lg">
                <div className="flex items-center text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                  <Plane className="w-3 h-3 mr-1 text-purple-400" />
                  <span>Overseas</span>
                </div>
                <span className="font-bold text-gray-100 text-sm">{boxOffice.overseas}</span>
              </div>
              <div className="flex flex-col justify-center bg-brand-dark/50 border border-brand-red/20 p-2.5 rounded-lg shadow-[inset_0_0_10px_rgba(255,0,0,0.1)]">
                <div className="flex items-center text-[10px] text-brand-red uppercase font-bold tracking-wider mb-1">
                  <Globe className="w-3 h-3 mr-1" />
                  <span>WW Gross</span>
                </div>
                <span className="font-black text-white text-sm drop-shadow-md">{boxOffice.worldwideGross}</span>
              </div>
            </div>
          </div>
        </div>

        <Link 
          to={`/box-office/${boxOffice.slug}`}
          className="w-full text-center py-2.5 bg-white/10 border border-gray-100/20 hover:bg-brand-red hover:shadow-[0_0_15px_rgba(255,0,0,0.5)] text-gray-100 hover:text-white font-semibold rounded transition-all duration-300 text-sm tracking-wide"
        >
          View Full Details
        </Link>
      </div>
    </motion.div>
  );
};

export default BoxOfficeCard;


