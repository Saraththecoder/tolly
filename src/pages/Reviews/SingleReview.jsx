import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Star } from 'lucide-react';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import ShareWidget from '../../components/ShareWidget';
import { getReviewBySlug } from '../../services/api';

const SingleReview = () => {
  const { slug } = useParams();

  const { data: review, isLoading } = useQuery({
    queryKey: ['review', slug],
    queryFn: () => getReviewBySlug(slug),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-10">
        <LoadingSkeleton type="page" />
      </div>
    );
  }

  if (!review) {
    return <div className="text-center py-20 text-xl font-bold">Review not found</div>;
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-10">
      <Helmet>
        <title>{review.movieName} Review | CHITRAMBHALARE</title>
        <meta name="description" content={review.snippet} />
      </Helmet>

      <div className="max-w-4xl mx-auto glass-card rounded-2xl overflow-hidden border border-brand-red/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
        {/* Header Section */}
        <div className="bg-brand-light/80 text-gray-100 p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden border-b border-brand-red/10">
          {/* Background blur */}
          <div 
            className="absolute inset-0 opacity-20 blur-3xl scale-110"
            style={{ backgroundImage: `url(${review.poster || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80'})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          ></div>
          
          <img 
            src={review.poster || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80'} 
            alt={review.movieName} 
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80';
            }}
            className="w-48 md:w-64 rounded-xl shadow-2xl z-10 border-4 border-brand-red/10"
          />
          
          <div className="z-10 text-center md:text-left flex-grow">
            <h1 className="text-4xl md:text-5xl font-poppins font-bold mb-4">{review.movieName}</h1>
            <p className="text-gray-300 text-lg mb-8 italic">"{review.snippet}"</p>
            
            <div className="inline-flex items-center bg-brand-red/5 backdrop-blur-md rounded-full px-6 py-3 border border-gray-100/20">
              <Star className="w-8 h-8 text-yellow-400 fill-current mr-3" />
              <div className="flex flex-col items-start">
                <span className="text-xs text-gray-300 uppercase tracking-wider font-bold">Rating</span>
                <span className="text-2xl font-bold font-poppins">{review.rating} <span className="text-lg text-gray-100/70">/ 5</span></span>
              </div>
            </div>
            
            {review.ottPlatform && (
              <div className="mt-4 flex flex-col md:flex-row items-center justify-center md:justify-start gap-2">
                <span className="text-sm text-gray-400">Where to Watch:</span>
                <span className={`px-3 py-1 rounded text-sm font-bold shadow-lg ${review.ottPlatform === 'Theatrical' ? 'bg-zinc-800 text-gray-200 border border-zinc-700' : 'bg-brand-red text-white shadow-[0_0_15px_rgba(255,0,0,0.4)]'}`}>
                  {review.ottPlatform}
                </span>
                <span className="text-xs text-brand-red font-bold uppercase tracking-wide">{review.ottReleaseDate}</span>
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8 md:p-12 space-y-10">
          
          <section>
            <h2 className="text-2xl font-poppins font-bold text-gray-100 mb-4 flex items-center">
              <span className="w-1.5 h-6 bg-brand-red mr-3 rounded-full"></span>
              Story
            </h2>
            <p className="text-gray-300 leading-relaxed font-inter text-lg">
              {review.story}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-poppins font-bold text-gray-100 mb-4 flex items-center">
              <span className="w-1.5 h-6 bg-brand-red mr-3 rounded-full"></span>
              Performances
            </h2>
            <p className="text-gray-300 leading-relaxed font-inter text-lg">
              {review.performances}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-poppins font-bold text-gray-100 mb-4 flex items-center">
              <span className="w-1.5 h-6 bg-brand-red mr-3 rounded-full"></span>
              Technical Aspects
            </h2>
            <p className="text-gray-300 leading-relaxed font-inter text-lg">
              {review.technicalAspects}
            </p>
          </section>

          <div className="bg-[#18181B] border border-brand-red/20 rounded-xl p-8 mt-12 text-center shadow-[0_0_20px_rgba(255,0,0,0.1)]">
            <h2 className="text-2xl font-poppins font-bold text-gray-100 mb-4">Verdict</h2>
            <p className="text-2xl font-bold text-gray-100 drop-shadow-[0_0_10px_rgba(255,0,0,0.5)]">
              {review.verdict}
            </p>
          </div>
          
          <ShareWidget title={`${review.movieName} Review`} />
          
        </div>
      </div>
    </div>
  );
};

export default SingleReview;


