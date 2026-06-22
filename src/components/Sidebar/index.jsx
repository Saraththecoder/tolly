import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { getArticles, getReviews, getBoxOfficeTop5, getUpcomingSchedules } from '../../services/api';
import { Calendar, Film, Flame, Star, TrendingUp } from 'lucide-react';

const Sidebar = () => {
  const { data: trendingArticles, refetch: refetchTrending } = useQuery({
    queryKey: ['trending-articles'],
    queryFn: () => getArticles({ limit: 50 }),
    select: (data) => data.data.filter(a => a.tags.includes('Trending')).slice(0, 5), // show top 5 for better layout balance
  });

  const { data: latestReviews, refetch: refetchReviews } = useQuery({
    queryKey: ['latest-reviews'],
    queryFn: getReviews,
    select: (data) => data.slice(0, 4),
  });

  const { data: top5BoxOffice, refetch: refetchTop5 } = useQuery({
    queryKey: ['sidebar-top5'],
    queryFn: getBoxOfficeTop5,
  });

  const { data: upcomingSchedules, refetch: refetchSchedules } = useQuery({
    queryKey: ['sidebar-schedules'],
    queryFn: getUpcomingSchedules,
  });

  // Listen to DB changes for real-time refetching
  useEffect(() => {
    const handleDbChange = () => {
      refetchTrending();
      refetchReviews();
      refetchTop5();
      refetchSchedules();
    };
    window.addEventListener('tolly_db_change', handleDbChange);
    return () => window.removeEventListener('tolly_db_change', handleDbChange);
  }, [refetchTrending, refetchReviews, refetchTop5, refetchSchedules]);

  const popularTags = ['Tollywood', 'Box Office', 'Reviews', 'Interviews', 'Gossips', 'OTT'];

  const getDaysRemainingText = (dateStr, status) => {
    if (status === 'TBA' || !dateStr) return 'TBA';
    const release = new Date(dateStr);
    if (isNaN(release.getTime())) return status || '2026';
    const now = new Date();
    
    // Clear time parts
    release.setHours(0,0,0,0);
    now.setHours(0,0,0,0);
    const diffTime = release - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays < 0) return 'Released';
    return `${diffDays} Days`;
  };

  const getVerdictColorClass = (verdict) => {
    switch (verdict?.toLowerCase()) {
      case 'blockbuster': return 'text-yellow-500 border-yellow-500/20 bg-yellow-500/10';
      case 'hit': return 'text-green-500 border-green-500/20 bg-green-500/10';
      case 'flop': return 'text-red-500 border-red-500/20 bg-red-500/10';
      default: return 'text-gray-400 border-gray-700 bg-gray-800/50';
    }
  };

  return (
    <aside className="w-full lg:w-[30%] space-y-8 lg:sticky lg:top-24 h-fit">
      {/* Trending Posts */}
      {trendingArticles && trendingArticles.length > 0 && (
        <div className="glass-card rounded-xl border border-brand-red/10 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          <h3 className="text-xl font-poppins font-bold mb-4 flex items-center border-b border-gray-100/20 pb-2">
            <Flame className="w-5 h-5 text-brand-red mr-2" />
            Trending Now
          </h3>
          <div className="space-y-4 mt-6">
            {trendingArticles.map((article, idx) => (
              <Link 
                to={`/movie-news/${article.slug}`} 
                key={article.id} 
                className="flex group items-start gap-4 p-3 rounded-xl hover:bg-white/5 transition-all duration-300 border border-transparent hover:border-brand-red/20 hover:shadow-[0_5px_20px_rgba(255,0,0,0.05)]"
              >
                <div className="relative shrink-0">
                  <img 
                    src={article.thumbnail || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80'} 
                    alt={article.title} 
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80';
                    }}
                    className="w-16 h-16 rounded-lg object-cover shadow-md border border-gray-800 group-hover:border-brand-red/50 transition-colors"
                  />
                  <div className="absolute -top-1.5 -left-1.5 w-6 h-6 bg-brand-red rounded-full flex items-center justify-center text-white font-poppins font-bold text-[10px] shadow-[0_0_10px_rgba(255,0,0,0.5)] ring-2 ring-[#18181B]">
                    {idx + 1}
                  </div>
                </div>
                <div className="flex flex-col justify-center h-full pt-0.5">
                  <h4 className="font-inter font-bold text-gray-200 group-hover:text-brand-red transition-colors line-clamp-2 leading-snug text-sm">
                    {article.title}
                  </h4>
                  <p className="text-[9px] text-gray-400 mt-1 uppercase tracking-wider font-semibold">
                    {new Date(article.date).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Box Office Top 5 (Admin Controlled) */}
      {top5BoxOffice && top5BoxOffice.length > 0 && (
        <div className="glass-card rounded-xl border border-brand-red/10 p-6 relative overflow-hidden">
          <h3 className="text-xl font-poppins font-bold mb-4 flex items-center border-b border-gray-100/20 pb-2">
            <TrendingUp className="w-5 h-5 text-brand-red mr-2" />
            Box Office Top 5
          </h3>
          <div className="space-y-3 mt-6">
            {top5BoxOffice.map((film, idx) => (
              <div 
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg bg-[#18181B]/40 border border-gray-800/40 hover:border-brand-red/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={`font-poppins font-bold text-lg w-5 text-center ${idx === 0 ? 'text-yellow-500 text-xl' : 'text-gray-500'}`}>
                    {film.rank}
                  </span>
                  <div>
                    <div className="font-inter font-bold text-gray-200 text-sm">{film.movieName}</div>
                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${getVerdictColorClass(film.verdict)} mt-1 inline-block`}>
                      {film.verdict}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-poppins font-bold text-yellow-500 text-sm">{film.gross}</div>
                  <div className={`text-[10px] font-medium flex items-center justify-end ${film.trend?.includes('▲') ? 'text-green-500' : 'text-red-500'}`}>
                    {film.trend}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Schedules (Admin Controlled) */}
      {upcomingSchedules && upcomingSchedules.length > 0 && (
        <div className="glass-card rounded-xl border border-brand-red/10 p-6 relative overflow-hidden">
          <h3 className="text-xl font-poppins font-bold mb-4 flex items-center border-b border-gray-100/20 pb-2">
            <Calendar className="w-5 h-5 text-brand-red mr-2" />
            Upcoming Releases
          </h3>
          <div className="space-y-3.5 mt-6">
            {upcomingSchedules.slice(0, 4).map((schedule, idx) => (
              <div 
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg bg-[#18181B]/40 border border-gray-800/40"
              >
                <div>
                  <div className="font-inter font-bold text-gray-200 text-sm leading-tight">{schedule.movieName}</div>
                  <div className="text-[10px] text-gray-400 mt-1 uppercase tracking-wide font-medium">
                    {schedule.language} • {schedule.releaseDate ? new Date(schedule.releaseDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBA'}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="bg-brand-red/10 border border-brand-red/20 text-brand-red text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-[0_0_10px_rgba(212,43,43,0.1)]">
                    {getDaysRemainingText(schedule.releaseDate, schedule.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Latest Reviews */}
      {latestReviews && latestReviews.length > 0 && (
        <div className="glass-card rounded-xl border border-brand-red/10 p-6 relative overflow-hidden">
          <h3 className="text-xl font-poppins font-bold mb-4 flex items-center border-b border-gray-100/20 pb-2">
            <Film className="w-5 h-5 text-brand-red mr-2" />
            Latest Reviews
          </h3>
          <div className="space-y-5 mt-6">
            {latestReviews.map((review) => (
              <Link to={`/reviews/${review.slug}`} key={review.id} className="flex group items-center relative p-2 rounded-lg hover:bg-brand-red/5 transition-colors duration-300">
                <img 
                  src={review.poster || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80'} 
                  alt={review.movieName} 
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80';
                  }}
                  className="w-12 h-18 object-cover rounded shadow-[0_0_15px_rgba(0,0,0,0.5)] border border-brand-red/10 group-hover:border-brand-red/80 transition-all group-hover:scale-105 z-10"
                />
                <div className="ml-4 flex flex-col justify-center z-10 w-full min-w-0">
                  <h4 className="font-inter font-bold text-gray-200 group-hover:text-brand-red transition-colors line-clamp-2 leading-tight text-sm">
                    {review.movieName}
                  </h4>
                  <div className="flex items-center mt-2 justify-between">
                    <span className="bg-[#18181B] border border-yellow-500/30 text-yellow-500 flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                      <Star className="w-2.5 h-2.5 mr-0.5 fill-current" />
                      {review.rating}/5
                    </span>
                    {review.ottPlatform && review.ottPlatform !== 'Theatrical' && (
                      <span className="text-[9px] uppercase font-bold text-brand-red border border-brand-red/20 px-1.5 py-0.5 rounded bg-brand-red/5">
                        {review.ottPlatform}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Popular Tags */}
      <div className="glass-card rounded-xl border border-brand-red/10 p-6">
        <h3 className="text-xl font-poppins font-bold mb-4 flex items-center border-b border-gray-100/20 pb-2">
          <span className="w-1.5 h-5 bg-brand-red mr-2 inline-block"></span>
          Popular Tags
        </h3>
        <div className="flex flex-wrap gap-2">
          {popularTags.map(tag => (
            <Link
              key={tag}
              to={`/movie-news?category=${tag}`}
              className="px-3 py-1.5 bg-[#18181B] border border-brand-red/10 text-gray-300 text-xs font-medium rounded-full hover:bg-brand-red hover:border-brand-red hover:text-white hover:shadow-[0_0_15px_rgba(255,0,0,0.4)] transition-all"
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
