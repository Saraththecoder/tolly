import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Calendar, User, Share2, Link2 } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import NewsCard from '../../components/NewsCard';
import ReviewCard from '../../components/ReviewCard';
import ShareWidget from '../../components/ShareWidget';
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
        <title>{article.title} | CHITRAMBHALARE</title>
        <meta name="description" content={article.excerpt} />
      </Helmet>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <article className="w-full lg:w-[70%] glass-card rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-brand-red/10 overflow-hidden">
          {/* Top Section */}
          <div className="p-6 md:p-8">
            <div className="mb-4">
              <span className="bg-brand-red text-gray-100 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {article.category}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-poppins font-bold text-gray-100 leading-tight mb-6">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-t border-b border-brand-red/10 mb-8">
              <div className="flex items-center space-x-6">
                <div className="flex items-center text-gray-100/50">
                  <User className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">{article.author}</span>
                </div>
                <div className="flex items-center text-gray-100/50">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">
                    {new Date(article.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Social Share */}
              <ShareWidget title={article.title} />
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
            <div className="prose prose-invert prose-lg max-w-none font-inter text-gray-300 leading-relaxed prose-headings:font-poppins prose-a:text-gray-100">
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
            <div className="mt-10 pt-6 border-t border-brand-red/10">
              <h4 className="text-sm font-bold text-gray-100 mb-3 uppercase tracking-wider">Tags:</h4>
              <div className="flex flex-wrap gap-2">
                {article.tags?.map(tag => (
                  <Link key={tag} to={`/movie-news?category=${tag}`} className="bg-white border border-brand-red/10 text-gray-300 px-4 py-2 rounded-full text-sm font-medium hover:bg-brand-red hover:text-gray-100 hover:border-gray-100/20 transition-colors">
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          
          {/* Internal Linking / Related Articles */}
          <div className="bg-brand-light/80 p-6 md:p-8 border-t border-brand-red/10">
            <h3 className="text-2xl font-poppins font-bold text-gray-100 mb-6 border-l-4 border-gray-100/20 pl-3">
              Related Articles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              {relatedNews?.data.map(news => (
                 <NewsCard key={news.id} article={news} />
              ))}
            </div>

            <h3 className="text-2xl font-poppins font-bold text-gray-100 mb-6 border-l-4 border-gray-100/20 pl-3">
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


