import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { getArticlesByLetter } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import LoadingSkeleton from '../../components/LoadingSkeleton';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const Archive = () => {
  const [selectedLetter, setSelectedLetter] = useState('A');

  const { data: articles, isLoading } = useQuery({
    queryKey: ['archive', selectedLetter],
    queryFn: () => getArticlesByLetter(selectedLetter),
  });

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <Helmet>
        <title>A-Z Movie News Archive | CHITRAMBHALARE</title>
      </Helmet>

      <div className="mb-8">
        <h1 className="text-3xl font-poppins font-bold text-gray-100 mb-2">A-Z Article Directory</h1>
        <p className="text-gray-100/60 font-inter">Browse our complete archive of movie news alphabetically.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="w-full lg:w-[70%] glass-card rounded-xl border border-brand-red/10 p-6 md:p-8">
          
          {/* Alphabet Selection */}
          <div className="flex flex-wrap gap-2 mb-8 pb-8 border-b border-brand-red/10 justify-center">
            {ALPHABET.map(letter => (
              <button
                key={letter}
                onClick={() => setSelectedLetter(letter)}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  selectedLetter === letter 
                    ? 'bg-brand-red text-gray-100 shadow-[0_0_15px_rgba(255,0,0,0.5)]' 
                    : 'bg-[#18181B] border border-gray-800 text-gray-300 hover:bg-brand-red/10 hover:border-brand-red/30'
                }`}
              >
                {letter}
              </button>
            ))}
          </div>

          <h2 className="text-2xl font-poppins font-bold text-gray-100 mb-6">
            Articles starting with '{selectedLetter}'
          </h2>

          {/* Results */}
          {isLoading ? (
             <div className="space-y-4">
                {[...Array(5)].map((_, i) => <LoadingSkeleton key={i} type="text" />)}
             </div>
          ) : articles?.length === 0 ? (
            <div className="text-center py-12 bg-[#18181B] rounded border border-brand-red/10">
              <p className="text-gray-100/60 text-lg">No articles found starting with '{selectedLetter}'.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {articles?.map(article => (
                <li key={article.id} className="border-b border-gray-800 last:border-0 pb-4 last:pb-0">
                  <Link 
                    to={`/movie-news/${article.slug}`}
                    className="flex flex-col md:flex-row md:items-center justify-between group"
                  >
                    <span className="text-lg font-medium text-gray-100 group-hover:text-brand-red transition-colors mb-1 md:mb-0">
                      {article.title}
                    </span>
                    <span className="text-sm text-gray-100/60 whitespace-nowrap">
                      {new Date(article.date).toLocaleDateString()}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Sidebar */}
        <Sidebar />
      </div>
    </div>
  );
};

export default Archive;


