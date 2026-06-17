import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Calendar, User, Share2, Link2 } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import NewsCard from '../../components/NewsCard';
import ReviewCard from '../../components/ReviewCard';
import { getArticleBySlug, getArticles, getReviews } from '../../services/api';

const SingleArticle = () => {
  const { slug } = useParams();

  const { data: article, isLoading } = useQuery({
    queryKey: ['article', slug],
    queryFn: () => getArticleBySlug(slug),
  });

  const { data: relatedNews } = useQuery({
    queryKey: ['relatedNews', article?.category],
    queryFn: () => getArticles({ category: article?.category, limit: 2 }),
    enabled: !!article,
  });

  const { data: relatedReviews } = useQuery({
    queryKey: ['relatedReviews'],
    queryFn: () => getReviews(),
    select: (data) => data.slice(0, 2),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-8 flex gap-8">
        <div className="w-full lg:w-[70%]">
          <LoadingSkeleton type="page" />
        </div>
        <div className="hidden lg:block lg:w-[30%]">
          <LoadingSkeleton type="page" />
        </div>
      </div>
    );
  }

  if (!article) {
    return <div className="text-center py-20 text-xl font-bold">Article not found</div>;
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        url: window.location.href,
      }).catch(console.error);
    }
  };

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <Helmet>
        <title>{article.title} | Tollywood News</title>
        <meta name="description" content={article.excerpt} />
      </Helmet>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <article className="w-full lg:w-[70%] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Top Section */}
          <div className="p-6 md:p-8">
            <div className="mb-4">
              <span className="bg-brand-red text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {article.category}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-poppins font-bold text-gray-900 leading-tight mb-6">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-t border-b border-gray-100 mb-8">
              <div className="flex items-center space-x-6">
                <div className="flex items-center text-gray-600">
                  <User className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">{article.author}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">
                    {new Date(article.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Social Share */}
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500 font-medium mr-2 flex items-center">
                  <Share2 className="w-4 h-4 mr-1" /> Share:
                </span>
                <button className="w-8 h-8 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:opacity-80 transition-opacity">
                  <span className="font-bold text-sm">F</span>
                </button>
                <button className="w-8 h-8 rounded-full bg-[#1DA1F2] text-white flex items-center justify-center hover:opacity-80 transition-opacity">
                  <span className="font-bold text-sm">X</span>
                </button>
                <button onClick={handleShare} className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center hover:bg-gray-300 transition-colors">
                  <Link2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Featured Image */}
            <div className="mb-8 rounded-xl overflow-hidden aspect-[16/9]">
              <img 
                src={article.featuredImage} 
                alt={article.title} 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content Section */}
            <div className="prose prose-lg max-w-none prose-p:font-inter prose-p:text-gray-700 prose-p:leading-relaxed prose-headings:font-poppins prose-a:text-brand-red">
              {article.content.map((block, idx) => {
                if (block.type === 'paragraph') {
                  return <p key={idx} className="mb-6">{block.value}</p>;
                } else if (block.type === 'image') {
                  return (
                    <figure key={idx} className="my-8">
                      <img src={block.value} alt="Article visual" className="w-full rounded-xl" />
                    </figure>
                  );
                }
                return null;
              })}
            </div>
            
            {/* Tags */}
            <div className="mt-10 pt-6 border-t border-gray-100">
              <h4 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Tags:</h4>
              <div className="flex flex-wrap gap-2">
                {article.tags?.map(tag => (
                  <Link key={tag} to={`/movie-news?category=${tag}`} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-brand-red hover:text-white transition-colors">
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          
          {/* Internal Linking / Related Articles */}
          <div className="bg-gray-50 p-6 md:p-8 border-t border-gray-100">
            <h3 className="text-2xl font-poppins font-bold text-gray-900 mb-6 border-l-4 border-brand-red pl-3">
              Related Articles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              {relatedNews?.data.map(news => (
                 <NewsCard key={news.id} article={news} />
              ))}
            </div>

            <h3 className="text-2xl font-poppins font-bold text-gray-900 mb-6 border-l-4 border-brand-red pl-3">
              Related Reviews
            </h3>
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              {relatedReviews?.map(review => (
                 <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          </div>
        </article>

        {/* Sidebar */}
        <Sidebar />
      </div>
    </div>
  );
};

export default SingleArticle;
