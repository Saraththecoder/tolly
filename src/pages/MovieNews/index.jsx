import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';
import NewsCard from '../../components/NewsCard';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import Sidebar from '../../components/Sidebar';
import { getArticles } from '../../services/api';

const CATEGORIES = ['All', 'Tollywood', 'Bollywood', 'Hollywood', 'OTT', 'Interviews', 'Gossips'];

const MovieNews = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState('');
  
  const category = searchParams.get('category') || 'All';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const search = searchParams.get('search') || '';

  const { data, isLoading } = useQuery({
    queryKey: ['articles', { category, page, search }],
    queryFn: () => getArticles({ 
      page, 
      limit: 10, 
      category: category === 'All' ? null : category,
      search
    }),
  });

  const handleCategoryChange = (cat) => {
    setSearchParams({ category: cat, page: '1' });
    setSearchInput('');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ search: searchInput, page: '1' });
    } else {
      setSearchParams({ page: '1' });
    }
  };

  const handlePageChange = (newPage) => {
    const params = Object.fromEntries(searchParams.entries());
    setSearchParams({ ...params, page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <Helmet>
        <title>Movie News | Chithrambalare</title>
      </Helmet>

      {/* Header and Search */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-poppins font-bold text-white mb-2">Movie News</h1>
          <p className="text-gray-500 font-inter">Browse the latest updates and breaking news.</p>
        </div>
        
        <form onSubmit={handleSearch} className="relative w-full md:w-80">
          <input 
            type="text" 
            placeholder="Search news..." 
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-white/10 bg-brand-gray/40 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-red text-sm font-inter text-white"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <button type="submit" className="hidden">Search</button>
        </form>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content Area */}
        <div className="w-full lg:w-[70%] space-y-8">
          
          {/* Categories Filter */}
          <div className="flex flex-wrap gap-2 pb-4 border-b border-gray-100">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  category === cat 
                    ? 'bg-brand-red text-white' 
                    : 'bg-brand-gray/40 text-gray-300 hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* A-Z Directory Link */}
          <div className="flex justify-end">
             <Link to="/movie-news/archive" className="text-sm font-semibold text-brand-red hover:underline">
               Browse A-Z Archive Directory &rarr;
             </Link>
          </div>

          {/* Results Info */}
          {search && (
            <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-between">
              <span className="text-gray-700">Showing results for: <span className="font-bold">"{search}"</span></span>
              <button onClick={() => handleCategoryChange('All')} className="text-brand-red text-sm font-semibold hover:underline">
                Clear Search
              </button>
            </div>
          )}

          {/* Articles Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => <LoadingSkeleton key={i} type="card" />)}
            </div>
          ) : data?.data.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-gray-500 font-inter text-lg">No articles found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data?.data.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {data?.totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 pt-8 border-t border-gray-100 mt-8">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded text-sm font-medium disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>
              <div className="flex space-x-1">
                {[...Array(data.totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    className={`w-10 h-10 rounded flex items-center justify-center text-sm font-medium transition-colors ${
                      page === i + 1
                        ? 'bg-brand-red text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === data.totalPages}
                className="px-4 py-2 border border-gray-300 rounded text-sm font-medium disabled:opacity-50 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}

        </div>

        {/* Sidebar */}
        <Sidebar />
      </div>
    </div>
  );
};

export default MovieNews;
