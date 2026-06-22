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
        <title>{bo.movieName} Box Office Collection | CHITRAMBHALARE</title>
        <meta name="description" content={`Check out the detailed day-wise box office collections of ${bo.movieName}.`} />
      </Helmet>

      <div className="glass-card rounded-2xl border border-brand-red/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden max-w-5xl mx-auto">
        {/* Top Header */}
          <div className="bg-[#18181B] text-gray-100 p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 border-b border-brand-red/10">
          <img 
            src={bo.poster || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80'} 
            alt={bo.movieName} 
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80';
            }}
            className="w-48 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] border-2 border-brand-red/10"
          />
          <div className="text-center md:text-left flex-grow">
            <h1 className="text-4xl md:text-5xl font-poppins font-bold mb-4">{bo.movieName}</h1>
            <p className="text-gray-100/70 text-lg mb-6">Box Office Collection Report</p>
            <div className={`inline-block px-4 py-2 rounded-lg font-bold text-lg shadow-inner ${
              bo.verdict === 'Blockbuster' ? 'bg-red-600 text-gray-100' : 'bg-green-600 text-gray-100'
            }`}>
              Verdict: {bo.verdict}
            </div>
          </div>
        </div>

        {/* Overall Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/10 border-b border-brand-red/10">
          <div className="p-6 text-center hover:bg-white/5 transition-colors">
            <p className="text-sm text-gray-100/70 font-semibold mb-1 uppercase tracking-wider">India Net</p>
            <p className="text-2xl font-bold text-gray-100 tracking-widest">{bo.indiaNet}</p>
          </div>
          <div className="p-6 text-center hover:bg-white/5 transition-colors">
            <p className="text-sm text-gray-100/70 font-semibold mb-1 uppercase tracking-wider">India Gross</p>
            <p className="text-2xl font-bold text-gray-100 tracking-widest">{bo.indiaGross}</p>
          </div>
          <div className="p-6 text-center hover:bg-white/5 transition-colors">
            <p className="text-sm text-gray-100/70 font-semibold mb-1 uppercase tracking-wider">Overseas</p>
            <p className="text-2xl font-bold text-gray-100 tracking-widest">{bo.overseas}</p>
          </div>
          <div className="p-6 text-center bg-white/10 hover:bg-white/20 transition-colors shadow-[inset_0_0_20px_rgba(255,0,0,0.1)]">
            <p className="text-sm text-gray-100 font-semibold mb-1 uppercase tracking-wider">Worldwide Gross</p>
            <p className="text-2xl font-bold text-gray-100 tracking-widest glow-red">{bo.worldwideGross}</p>
          </div>
        </div>

        {/* Day-wise Collections Table */}
        <div className="p-8 md:p-12">
          <h2 className="text-2xl font-poppins font-bold text-gray-100 mb-6 flex items-center">
            <span className="w-1.5 h-6 bg-brand-red mr-3 rounded-full"></span>
            Day-wise Box Office Collection Tracker
          </h2>
          <div className="overflow-x-auto rounded-xl border border-brand-red/20 bg-[#18181B]">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-brand-red text-white font-bold uppercase text-xs tracking-wider">
                  <th className="p-4 border-b border-brand-red/20">Day / Date</th>
                  <th className="p-4 border-b border-brand-red/20">India Net</th>
                  <th className="p-4 border-b border-brand-red/20">Worldwide Gross</th>
                  <th className="p-4 border-b border-brand-red/20">Occupancy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/10">
                {bo.dailyBreakdown?.map((c, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors font-inter">
                    <td className="p-4 font-bold text-gray-100 border-r border-gray-100/10">{c.day}</td>
                    <td className="p-4 text-gray-300 font-semibold">{c.indiaNet}</td>
                    <td className="p-4 text-green-400 font-bold">{c.worldwideGross}</td>
                    <td className="p-4 text-gray-400">{c.occupancy}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-[#27272A] border-t border-brand-red/30">
                <tr>
                  <td className="p-4 font-bold text-white uppercase text-sm border-r border-gray-100/10">Total (Est.)</td>
                  <td className="p-4 text-white font-bold text-lg">{bo.totalIndiaNet || bo.indiaNet}</td>
                  <td className="p-4 text-brand-red font-bold text-lg">{bo.worldwideGross}</td>
                  <td className="p-4">--</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleBoxOffice;


