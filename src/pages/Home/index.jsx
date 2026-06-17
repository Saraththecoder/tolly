import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import HeroSlider from '../../components/HeroSlider';
import NewsCard from '../../components/NewsCard';
import ReviewCard from '../../components/ReviewCard';
import BoxOfficeCard from '../../components/BoxOfficeCard';
import Sidebar from '../../components/Sidebar';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import { getArticles, getReviews, getBoxOffice } from '../../services/api';

const Home = () => {
  const { data: articlesData, isLoading: articlesLoading } = useQuery({
    queryKey: ['articles', { limit: 15 }],
    queryFn: () => getArticles({ limit: 15 }),
  });

  const { data: reviewsData, isLoading: reviewsLoading } = useQuery({
    queryKey: ['reviews', { limit: 4 }],
    queryFn: () => getReviews(),
    select: (data) => data.slice(0, 4),
  });

  const { data: boxOfficeData, isLoading: boxOfficeLoading } = useQuery({
    queryKey: ['boxOffice', { limit: 3 }],
    queryFn: () => getBoxOffice(),
    select: (data) => data.slice(0, 3),
  });

  const articles = articlesData?.data || [];
  const latestNews = articles.slice(5, 10); // After 5 slider items, fetch 5 to fill grid
  const ottNews = articles.filter(a => a.category === 'OTT').slice(0, 4);

  if (articlesLoading) {
    return <LoadingSkeleton type="page" />;
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <Helmet>
        <title>CHITRAMBHALARE | Latest Movie News & Reviews</title>
        <meta name="description" content="Get the latest Tollywood movie news, unbiased reviews, box office collections, and exclusive celebrity interviews on CHITRAMBHALARE." />
      </Helmet>

      {/* Hero Section */}
      <HeroSlider articles={articles} />

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content Area - 70% */}
        <div className="w-full lg:w-[70%] space-y-12">
          
          {/* Latest Movie News Grid */}
          <section>
            <div className="flex justify-between items-center mb-6 border-b-2 border-white/10 pb-2">
              <h2 className="text-2xl font-poppins font-bold text-white border-b-2 border-brand-red -mb-[10px] pb-2">
                Latest Movie News
              </h2>
              <Link to="/movie-news" className="text-sm font-semibold text-brand-red hover:text-red-700 flex items-center">
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {latestNews.map((article, idx) => (
                <NewsCard key={article.id} article={article} isFeatured={idx === 0} />
              ))}
            </div>
          </section>

          {/* OTT Updates */}
          {ottNews.length > 0 && (
            <section>
            <div className="flex justify-between items-center mb-6 border-b-2 border-white/10 pb-2">
                <h2 className="text-2xl font-poppins font-bold text-white border-b-2 border-brand-red -mb-[10px] pb-2">
                  OTT Updates
                </h2>
                <Link to="/movie-news?category=OTT" className="text-sm font-semibold text-brand-red hover:text-red-700 flex items-center">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ottNews.map(article => (
                  <NewsCard key={article.id} article={article} />
                ))}
              </div>
            </section>
          )}

          {/* Latest Reviews */}
          <section>
            <div className="flex justify-between items-center mb-6 border-b-2 border-white/10 pb-2">
              <h2 className="text-2xl font-poppins font-bold text-white border-b-2 border-brand-red -mb-[10px] pb-2">
                Latest Reviews
              </h2>
              <Link to="/reviews" className="text-sm font-semibold text-brand-red hover:text-red-700 flex items-center">
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            {reviewsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4"><LoadingSkeleton type="card"/><LoadingSkeleton type="card"/></div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {reviewsData?.map(review => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            )}
          </section>

          {/* Box Office Updates */}
          <section>
            <div className="flex justify-between items-center mb-6 border-b-2 border-white/10 pb-2">
              <h2 className="text-2xl font-poppins font-bold text-white border-b-2 border-brand-red -mb-[10px] pb-2">
                Box Office Collections
              </h2>
              <Link to="/box-office" className="text-sm font-semibold text-brand-red hover:text-red-700 flex items-center">
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            {boxOfficeLoading ? (
              <LoadingSkeleton type="card" />
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {boxOfficeData?.map(bo => (
                  <BoxOfficeCard key={bo.id} boxOffice={bo} />
                ))}
              </div>
            )}
          </section>

        </div>

        {/* Sidebar - 30% */}
        <Sidebar />
      </div>
    </div>
  );
};

export default Home;
