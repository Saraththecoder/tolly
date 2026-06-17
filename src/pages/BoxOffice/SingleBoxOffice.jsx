import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import { getBoxOfficeBySlug } from '../../services/api';

const SingleBoxOffice = () => {
  const { slug } = useParams();

  const { data: bo, isLoading } = useQuery({
    queryKey: ['boxOffice', slug],
    queryFn: () => getBoxOfficeBySlug(slug),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-10">
        <LoadingSkeleton type="page" />
      </div>
    );
  }

  if (!bo) {
    return <div className="text-center py-20 text-xl font-bold">Box office data not found</div>;
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-10">
      <Helmet>
        <title>{bo.movieName} Box Office Collection | Chithrambalare</title>
        <meta name="description" content={`Check out the detailed day-wise box office collections of ${bo.movieName}.`} />
      </Helmet>

      <div className="glass-card rounded-2xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden max-w-5xl mx-auto">
        {/* Top Header */}
          <div className="bg-[#0A0A0A]/80 text-white p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 border-b border-white/10">
          <img 
            src={bo.poster} 
            alt={bo.movieName} 
            className="w-48 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] border-2 border-white/10"
          />
          <div className="text-center md:text-left flex-grow">
            <h1 className="text-4xl md:text-5xl font-poppins font-bold mb-4">{bo.movieName}</h1>
            <p className="text-gray-400 text-lg mb-6">Box Office Collection Report</p>
            <div className={`inline-block px-4 py-2 rounded-lg font-bold text-lg shadow-inner ${
              bo.verdict === 'Blockbuster' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
            }`}>
              Verdict: {bo.verdict}
            </div>
          </div>
        </div>

        {/* Overall Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/10 border-b border-white/10">
          <div className="p-6 text-center hover:bg-white/5 transition-colors">
            <p className="text-sm text-gray-400 font-semibold mb-1 uppercase tracking-wider">India Net</p>
            <p className="text-2xl font-bold text-white tracking-widest">{bo.indiaNet}</p>
          </div>
          <div className="p-6 text-center hover:bg-white/5 transition-colors">
            <p className="text-sm text-gray-400 font-semibold mb-1 uppercase tracking-wider">India Gross</p>
            <p className="text-2xl font-bold text-white tracking-widest">{bo.indiaGross}</p>
          </div>
          <div className="p-6 text-center hover:bg-white/5 transition-colors">
            <p className="text-sm text-gray-400 font-semibold mb-1 uppercase tracking-wider">Overseas</p>
            <p className="text-2xl font-bold text-white tracking-widest">{bo.overseas}</p>
          </div>
          <div className="p-6 text-center bg-brand-red/10 hover:bg-brand-red/20 transition-colors shadow-[inset_0_0_20px_rgba(230,0,0,0.1)]">
            <p className="text-sm text-brand-red font-semibold mb-1 uppercase tracking-wider">Worldwide Gross</p>
            <p className="text-2xl font-bold text-brand-red tracking-widest glow-red">{bo.worldwideGross}</p>
          </div>
        </div>

        {/* Day-wise Collections Table */}
        <div className="p-8 md:p-12">
          <h2 className="text-2xl font-poppins font-bold text-white mb-6">Day-wise Collections</h2>
          <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#0A0A0A]/30">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-gray-300 font-semibold uppercase text-sm tracking-wider">
                  <th className="p-4 border-b border-white/10">Day</th>
                  <th className="p-4 border-b border-white/10">Collection</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {bo.collections?.map((c, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-medium text-white">{c.day}</td>
                    <td className="p-4 text-gray-300">{c.collection}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleBoxOffice;
