import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import ReviewCard from '../../components/ReviewCard';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import { getReviews } from '../../services/api';

const Reviews = () => {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['all-reviews'],
    queryFn: getReviews,
  });

  return (
    <div className="container mx-auto px-4 lg:px-8 py-10">
      <Helmet>
        <title>Movie Reviews | CHITRAMBHALARE</title>
        <meta name="description" content="Read unbiased and detailed movie reviews." />
      </Helmet>

      <div className="mb-10 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-poppins font-bold text-white mb-4">Latest Movie Reviews</h1>
        <p className="text-gray-600 font-inter text-lg">
          Honest, unbiased, and detailed analysis of the newest releases in Tollywood and beyond.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {[...Array(10)].map((_, i) => <LoadingSkeleton key={i} type="card" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {reviews?.map(review => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Reviews;
