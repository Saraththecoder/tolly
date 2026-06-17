import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getArticles, getReviews } from '../../services/api';

const Sidebar = () => {
  const { data: trendingArticles } = useQuery({
    queryKey: ['trending-articles'],
    queryFn: () => getArticles({ limit: 5 }),
    select: (data) => data.data.filter(a => a.tags.includes('Trending')).slice(0, 5),
  });

  const { data: latestReviews } = useQuery({
    queryKey: ['latest-reviews'],
    queryFn: getReviews,
    select: (data) => data.slice(0, 5),
  });

  const popularTags = ['Tollywood', 'Box Office', 'Reviews', 'Interviews', 'Gossips', 'OTT'];

  return (
    <aside className="w-full lg:w-[30%] space-y-8 lg:sticky lg:top-24 h-fit">
      {/* Trending Posts */}
      <div className="glass-card rounded-xl border border-white/10 p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-red/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <h3 className="text-xl font-poppins font-bold mb-4 flex items-center border-b border-brand-red pb-2 inline-block">
          <span className="w-2 h-6 bg-brand-red mr-2 inline-block"></span>
          Trending Now
        </h3>
        <div className="space-y-4">
          {trendingArticles?.map((article, idx) => (
            <Link to={`/movie-news/${article.slug}`} key={article.id} className="flex group gap-4 items-start">
              <span className="text-3xl font-poppins font-bold text-gray-800 group-hover:text-brand-red transition-colors">
                {(idx + 1).toString().padStart(2, '0')}
              </span>
              <div>
                <h4 className="font-inter font-semibold text-gray-200 group-hover:text-brand-red transition-colors line-clamp-2">
                  {article.title}
                </h4>
                <p className="text-xs text-gray-400 mt-1">{new Date(article.date).toLocaleDateString()}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Latest Reviews */}
      <div className="glass-card rounded-xl border border-white/10 p-6">
        <h3 className="text-xl font-poppins font-bold mb-4 flex items-center border-b border-brand-red pb-2 inline-block">
          <span className="w-2 h-6 bg-brand-red mr-2 inline-block"></span>
          Latest Reviews
        </h3>
        <div className="space-y-4">
          {latestReviews?.map((review) => (
            <Link to={`/reviews/${review.slug}`} key={review.id} className="flex group gap-4">
              <img 
                src={review.poster} 
                alt={review.movieName} 
                className="w-16 h-20 object-cover rounded shadow-sm"
              />
              <div className="flex flex-col justify-center">
                <h4 className="font-inter font-semibold text-gray-200 group-hover:text-brand-red transition-colors line-clamp-2">
                  {review.movieName}
                </h4>
                <div className="flex items-center mt-1">
                  <span className="bg-green-600/20 border border-green-500/30 text-green-400 text-xs font-bold px-2 py-0.5 rounded shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                    {review.rating}/5
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Popular Tags */}
      <div className="glass-card rounded-xl border border-white/10 p-6">
        <h3 className="text-xl font-poppins font-bold mb-4 flex items-center border-b border-brand-red pb-2 inline-block">
          <span className="w-2 h-6 bg-brand-red mr-2 inline-block"></span>
          Popular Tags
        </h3>
        <div className="flex flex-wrap gap-2">
          {popularTags.map(tag => (
            <Link
              key={tag}
              to={`/movie-news?category=${tag}`}
              className="px-3 py-1.5 bg-black/40 border border-white/5 text-gray-300 text-sm font-medium rounded-full hover:bg-brand-red hover:border-brand-red hover:text-white hover:shadow-[0_0_15px_rgba(230,0,0,0.4)] transition-all"
            >
              {tag}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
