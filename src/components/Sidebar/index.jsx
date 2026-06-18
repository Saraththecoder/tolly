import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getArticles, getReviews } from '../../services/api';

const Sidebar = () => {
  const { data: trendingArticles } = useQuery({
    queryKey: ['trending-articles'],
    queryFn: () => getArticles({ limit: 50 }),
    select: (data) => data.data.filter(a => a.tags.includes('Trending')).slice(0, 10),
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
      <div className="glass-card rounded-xl border border-brand-red/10 p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <h3 className="text-xl font-poppins font-bold mb-4 flex items-center border-b border-gray-100/20 pb-2 inline-block">
          <span className="w-2 h-6 bg-brand-red mr-2 inline-block"></span>
          Trending Now
        </h3>
        <div className="space-y-4 mt-6">
          {trendingArticles?.map((article, idx) => (
            <Link to={`/movie-news/${article.slug}`} key={article.id} className="flex group items-start gap-4 p-3 rounded-xl hover:bg-white/5 transition-all duration-300 border border-transparent hover:border-brand-red/20 hover:shadow-[0_5px_20px_rgba(255,0,0,0.1)]">
              <div className="relative shrink-0">
                <img 
                  src={article.thumbnail} 
                  alt={article.title} 
                  className="w-20 h-20 rounded-lg object-cover shadow-md border border-gray-800 group-hover:border-brand-red/50 transition-colors"
                />
                <div className="absolute -top-2 -left-2 w-7 h-7 bg-brand-red rounded-full flex items-center justify-center text-white font-poppins font-bold text-xs shadow-[0_0_10px_rgba(255,0,0,0.5)] ring-2 ring-[#18181B]">
                  {idx + 1}
                </div>
              </div>
              <div className="flex flex-col justify-center h-full pt-1">
                <h4 className="font-inter font-bold text-gray-200 group-hover:text-brand-red transition-colors line-clamp-2 leading-snug">
                  {article.title}
                </h4>
                <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-wider font-semibold">
                  {new Date(article.date).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-xl border border-brand-red/10 p-6 relative overflow-hidden">
        <h3 className="text-xl font-poppins font-bold mb-4 flex items-center border-b border-gray-100/20 pb-2 inline-block">
          <span className="w-2 h-6 bg-brand-red mr-2 inline-block"></span>
          Latest Reviews
        </h3>
        <div className="space-y-5 mt-6">
          {latestReviews?.map((review) => (
            <Link to={`/reviews/${review.slug}`} key={review.id} className="flex group items-center relative p-2 rounded-lg hover:bg-brand-red/5 transition-colors duration-300">
              <img 
                src={review.poster} 
                alt={review.movieName} 
                className="w-16 h-24 object-cover rounded shadow-[0_0_15px_rgba(0,0,0,0.5)] border border-brand-red/10 group-hover:border-brand-red/80 transition-all group-hover:scale-105 z-10"
              />
              <div className="ml-4 flex flex-col justify-center z-10 w-full">
                <h4 className="font-inter font-bold text-gray-200 group-hover:text-brand-red transition-colors line-clamp-2 leading-tight">
                  {review.movieName}
                </h4>
                <div className="flex items-center mt-2 justify-between">
                  <span className="bg-[#18181B] border border-yellow-500/30 text-yellow-500 flex items-center text-xs font-bold px-2 py-1 rounded shadow-sm">
                    <svg className="w-3 h-3 mr-1 fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    {review.rating}/5
                  </span>
                  {review.ottPlatform && review.ottPlatform !== 'Theatrical' && (
                    <span className="text-[10px] uppercase font-bold text-brand-red border border-brand-red/30 px-1.5 py-0.5 rounded">
                      {review.ottPlatform}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Popular Tags */}
      <div className="glass-card rounded-xl border border-brand-red/10 p-6">
        <h3 className="text-xl font-poppins font-bold mb-4 flex items-center border-b border-gray-100/20 pb-2 inline-block">
          <span className="w-2 h-6 bg-brand-red mr-2 inline-block"></span>
          Popular Tags
        </h3>
        <div className="flex flex-wrap gap-2">
          {popularTags.map(tag => (
            <Link
              key={tag}
              to={`/movie-news?category=${tag}`}
              className="px-3 py-1.5 bg-[#18181B] border border-brand-red/10 text-gray-300 text-sm font-medium rounded-full hover:bg-brand-red hover:border-brand-red hover:text-white hover:shadow-[0_0_15px_rgba(255,0,0,0.4)] transition-all"
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


