import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Globe, RefreshCw, Star, TrendingUp } from 'lucide-react';
import { getNorthAmericaCollections } from '../../services/api';

const NorthAmericaCollections = () => {
  const { data: collections, isLoading, refetch } = useQuery({
    queryKey: ['northAmericaCollections'],
    queryFn: getNorthAmericaCollections,
  });

  // Listen to database changes for real-time updates
  useEffect(() => {
    const handleDbChange = () => {
      refetch();
    };
    window.addEventListener('tolly_db_change', handleDbChange);
    return () => window.removeEventListener('tolly_db_change', handleDbChange);
  }, [refetch]);

  if (isLoading) {
    return (
      <div className="glass-card rounded-xl p-6 border border-brand-red/10 animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-32 bg-gray-800 rounded"></div>
          <div className="h-32 bg-gray-800 rounded"></div>
          <div className="h-32 bg-gray-800 rounded"></div>
        </div>
      </div>
    );
  }

  if (!collections || collections.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-6 border-b-2 border-brand-red/10 pb-2">
        <div className="flex items-center gap-2.5">
          <h2 className="text-2xl font-poppins font-bold text-gray-100 border-b-2 border-brand-red -mb-[10px] pb-2 flex items-center">
            <Globe className="w-5 h-5 mr-2 text-brand-red animate-spin-slow" />
            North America Collections
          </h2>
          <span className="bg-brand-red/10 border border-brand-red/30 text-brand-red text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center mt-1 animate-pulse shadow-[0_0_10px_rgba(212,43,43,0.2)]">
            <span className="w-1.5 h-1.5 bg-brand-red rounded-full mr-1"></span>
            LIVE TRACKING
          </span>
        </div>
        <button 
          onClick={() => refetch()} 
          className="text-xs font-semibold text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
          title="Refresh Data"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {collections.map((movie) => (
          <div 
            key={movie.id} 
            className="glass-card group relative rounded-xl border border-brand-red/10 overflow-hidden hover:border-brand-red/30 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(212,43,43,0.15)] flex flex-col justify-between"
          >
            {/* Upper Info Section */}
            <div className="p-5 flex gap-4">
              {/* Poster Thumbnail */}
              <div className="w-20 h-28 shrink-0 rounded-lg overflow-hidden border border-gray-800 bg-brand-dark shadow-md group-hover:border-brand-red/40 transition-colors">
                <img 
                  src={movie.poster || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80'} 
                  alt={movie.movieName} 
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80';
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Title & Key Stats */}
              <div className="space-y-1.5 min-w-0">
                <h3 className="font-poppins font-bold text-gray-200 group-hover:text-brand-red transition-colors truncate text-lg leading-tight">
                  {movie.movieName}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <span className="px-1.5 py-0.5 bg-gray-800 rounded font-semibold text-[10px]">
                    {movie.screens || 'N/A'} Screens
                  </span>
                  <span>•</span>
                  <span className="text-[10px] text-green-500 font-bold uppercase tracking-wider flex items-center">
                    <Star className="w-3 h-3 fill-current mr-0.5" /> {movie.status || 'Active'}
                  </span>
                </div>
                <div className="pt-2">
                  <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Hourly Gross</div>
                  <div className="text-2xl font-poppins font-bold text-yellow-500 flex items-center gap-1">
                    {movie.hourlyGross || '$0'}
                    <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-ping shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Collections Grid */}
            <div className="bg-[#18181B]/80 border-t border-brand-red/10 p-4 grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider">Premiere</div>
                <div className="font-poppins font-bold text-gray-200 text-sm">{movie.premierGross || '—'}</div>
              </div>
              <div className="border-l border-gray-800">
                <div className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider">Total Gross</div>
                <div className="font-poppins font-bold text-brand-red text-sm">{movie.totalGross || '—'}</div>
              </div>
            </div>

            {/* Last Updated Footer Banner */}
            <div className="bg-brand-red/5 px-4 py-1.5 border-t border-brand-red/5 flex justify-between items-center text-[10px] text-gray-400">
              <span className="flex items-center gap-1 font-semibold text-[9px] uppercase tracking-wide text-brand-red">
                <TrendingUp className="w-3 h-3" /> Live Feed
              </span>
              <span>Updated: {movie.lastUpdated || 'Just now'}</span>
            </div>
          </div>
        ))}
      </div>

      <style jsx global>{`
        .glass-card {
          background: rgba(19, 26, 43, 0.6);
          backdrop-filter: blur(10px);
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
};

export default NorthAmericaCollections;
