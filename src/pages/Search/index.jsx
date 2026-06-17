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
        <title>Search | Tollywood Portal</title>
      </Helmet>
      
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-4xl font-poppins font-bold text-gray-900 mb-6">Search Tollywood Portal</h1>
        <p className="text-gray-500 mb-8 font-inter">Find the latest news, reviews, and box office updates.</p>
        
        <form onSubmit={handleSearch} className="relative w-full shadow-lg rounded-full overflow-hidden flex">
          <div className="relative flex-grow">
            <SearchIcon className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
            <input 
              type="text" 
              placeholder="What are you looking for?" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-16 pr-6 py-4 text-lg border-0 focus:ring-0 text-gray-900 font-inter outline-none"
              autoFocus
            />
          </div>
          <button 
            type="submit" 
            className="bg-brand-red text-white px-8 py-4 font-bold text-lg hover:bg-red-700 transition-colors"
          >
            Search
          </button>
        </form>
      </div>
    </div>
  );
};

export default Search;
