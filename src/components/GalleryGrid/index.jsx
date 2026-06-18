import { useQuery } from '@tanstack/react-query';
import { Camera } from 'lucide-react';
import { getGalleries } from '../../services/api';

const GalleryGrid = () => {
  const { data: galleries } = useQuery({
    queryKey: ['galleries'],
    queryFn: getGalleries,
  });

  if (!galleries || galleries.length === 0) return null;

  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-8 border-b border-brand-red/20 pb-4">
        <h2 className="text-3xl font-poppins font-bold text-gray-100 flex items-center">
          <Camera className="w-8 h-8 mr-3 text-brand-red" />
          Exclusive Galleries
        </h2>
        <button className="text-brand-red hover:text-white transition-colors text-sm font-bold uppercase tracking-wider">
          View All Photos &rarr;
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {galleries.slice(0, 4).map((gallery) => (
          <div key={gallery.id} className="group relative rounded-xl overflow-hidden cursor-pointer aspect-[3/4] bg-[#18181B] shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
            <img 
              src={gallery.coverImage || gallery.image} 
              alt={gallery.title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 transition-opacity duration-300"></div>
            
            <div className="absolute bottom-0 left-0 w-full p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              <div className="bg-brand-red/90 text-white text-xs font-bold px-2 py-1 rounded inline-block mb-2 backdrop-blur-sm shadow-[0_0_10px_rgba(255,0,0,0.5)]">
                {gallery.images ? gallery.images.length : (gallery.photosCount || 0)} Photos
              </div>
              <h3 className="text-gray-100 font-poppins font-bold text-lg md:text-xl line-clamp-2 leading-tight group-hover:text-brand-red transition-colors">
                {gallery.title}
              </h3>
            </div>
            
            {/* Hover overlay icon */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-black/50 backdrop-blur-sm p-4 rounded-full border border-brand-red/30 shadow-[0_0_20px_rgba(255,0,0,0.4)]">
                <Camera className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default GalleryGrid;
