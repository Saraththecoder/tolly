import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search as SearchIcon } from 'lucide-react';

const Search = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/movie-news?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-20 flex flex-col items-center min-h-[60vh]">
      <Helmet>
        <title>Search | CHITRAMBHALARE</title>
      </Helmet>
      
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-4xl font-poppins font-bold text-gray-100 mb-6">Search CHITRAMBHALARE</h1>
        <p className="text-gray-100/60 mb-8 font-inter">Find the latest news, reviews, and box office updates.</p>
        
        <form onSubmit={handleSearch} className="relative w-full shadow-lg rounded-full overflow-hidden flex">
          <div className="relative flex-grow">
            <SearchIcon className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-100/70 w-6 h-6" />
            <input 
              type="text" 
              placeholder="What are you looking for?" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-16 pr-6 py-4 text-lg border-2 border-brand-red/20 bg-[#18181B] focus:border-brand-red focus:ring-4 focus:ring-brand-red/30 focus:shadow-[0_0_25px_rgba(255,0,0,0.4)] text-gray-100 font-inter outline-none transition-all duration-300 rounded-full"
              autoFocus
            />
          </div>
          <button 
            type="submit" 
            className="bg-brand-red text-gray-100 px-8 py-4 font-bold text-lg hover:bg-brand-red/80 transition-colors"
          >
            Search
          </button>
        </form>
      </div>
    </div>
  );
};

export default Search;


