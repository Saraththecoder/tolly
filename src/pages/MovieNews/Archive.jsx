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
        <title>A-Z Movie News Archive | Tollywood Portal</title>
      </Helmet>

      <div className="mb-8">
        <h1 className="text-3xl font-poppins font-bold text-gray-900 mb-2">A-Z Article Directory</h1>
        <p className="text-gray-500 font-inter">Browse our complete archive of movie news alphabetically.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="w-full lg:w-[70%] bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
          
          {/* Alphabet Selection */}
          <div className="flex flex-wrap gap-2 mb-8 pb-8 border-b border-gray-100 justify-center">
            {ALPHABET.map(letter => (
              <button
                key={letter}
                onClick={() => setSelectedLetter(letter)}
                className={`w-10 h-10 rounded text-lg font-bold font-poppins transition-colors flex items-center justify-center ${
                  selectedLetter === letter 
                    ? 'bg-brand-red text-white shadow-md' 
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {letter}
              </button>
            ))}
          </div>

          <h2 className="text-2xl font-poppins font-bold text-gray-900 mb-6">
            Articles starting with '{selectedLetter}'
          </h2>

          {/* Results */}
          {isLoading ? (
             <div className="space-y-4">
                {[...Array(5)].map((_, i) => <LoadingSkeleton key={i} type="text" />)}
             </div>
          ) : articles?.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded border border-gray-100">
              <p className="text-gray-500 text-lg">No articles found starting with '{selectedLetter}'.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {articles?.map(article => (
                <li key={article.id} className="border-b border-gray-50 last:border-0 pb-4 last:pb-0">
                  <Link 
                    to={`/movie-news/${article.slug}`}
                    className="flex flex-col md:flex-row md:items-center justify-between group"
                  >
                    <span className="text-lg font-medium text-gray-800 group-hover:text-brand-red transition-colors mb-1 md:mb-0">
                      {article.title}
                    </span>
                    <span className="text-sm text-gray-500 whitespace-nowrap">
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
