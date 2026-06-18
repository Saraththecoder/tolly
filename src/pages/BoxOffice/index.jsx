import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import BoxOfficeCard from '../../components/BoxOfficeCard';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import { getBoxOffice } from '../../services/api';

const BoxOffice = () => {
  const { data: boxOfficeData, isLoading } = useQuery({
    queryKey: ['all-box-office'],
    queryFn: getBoxOffice,
  });

  return (
    <div className="container mx-auto px-4 lg:px-8 py-10">
      <Helmet>
        <title>Box Office Collections | CHITRAMBHALARE</title>
        <meta name="description" content="Latest box office collections and tracking for Tollywood movies." />
      </Helmet>

      <div className="mb-10 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-poppins font-bold text-gray-100 mb-4">Box Office Collections</h1>
        <p className="text-gray-100/50 font-inter text-lg">
          Track the latest worldwide and domestic collections, day-wise breakdowns, and final verdicts.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <LoadingSkeleton key={i} type="card" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boxOfficeData?.map(bo => (
            <BoxOfficeCard key={bo.id} boxOffice={bo} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BoxOffice;


