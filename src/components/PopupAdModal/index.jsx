import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, ExternalLink } from 'lucide-react';
import { getPopupAd } from '../../services/api';

const PopupAdModal = ({ forceShow = false }) => {
  const { data: adData, isLoading } = useQuery({
    queryKey: ['popupAd'],
    queryFn: getPopupAd,
  });

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check session storage to see if ad was already dismissed
    const dismissed = sessionStorage.getItem('tolly_ad_dismissed');
    
    if (adData && adData.active && (dismissed !== 'true' || forceShow)) {
      // Small delay before showing the popup for premium entrance feel
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [adData, forceShow]);

  // Listen to custom admin preview trigger
  useEffect(() => {
    const handlePreview = (e) => {
      if (e.detail && e.detail.ad) {
        setIsOpen(true);
      }
    };
    window.addEventListener('tolly_ad_preview', handlePreview);
    return () => window.removeEventListener('tolly_ad_preview', handlePreview);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    if (!forceShow) {
      sessionStorage.setItem('tolly_ad_dismissed', 'true');
    }
  };

  if (!isOpen || isLoading || !adData) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-brand-dark/80 backdrop-blur-md transition-opacity duration-300"
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-[#131a2b] border border-brand-red/30 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(212,43,43,0.3)] transform transition-all duration-300 animate-scale-up z-50">
        
        {/* Banner Image */}
        {adData.imageUrl && (
          <div className="relative h-64 w-full overflow-hidden">
            <img 
              src={adData.imageUrl} 
              alt={adData.title || "Advertisement"} 
              className="w-full h-full object-cover"
            />
            {/* Top vignette overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent" />
          </div>
        )}

        {/* Content Box */}
        <div className="p-6 md:p-8 space-y-6">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-brand-red uppercase tracking-widest bg-brand-red/10 px-2.5 py-1 rounded-full border border-brand-red/20 inline-block">
              🔥 SPECIAL ANNOUNCEMENT
            </span>
            <h3 className="text-xl md:text-2xl font-poppins font-bold text-gray-100 leading-snug">
              {adData.title}
            </h3>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {adData.linkUrl && (
              <a
                href={adData.linkUrl}
                target={adData.linkUrl.startsWith('http') ? '_blank' : '_self'}
                rel="noopener noreferrer"
                onClick={handleClose}
                className="flex-1 inline-flex items-center justify-center bg-brand-red text-white text-sm font-bold px-6 py-3.5 rounded-xl hover:bg-brand-red/95 transition-all shadow-[0_0_20px_rgba(212,43,43,0.4)] hover:shadow-[0_0_30px_rgba(212,43,43,0.6)] hover:-translate-y-0.5 text-center"
              >
                {adData.buttonText || "Check It Out"} 
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            )}
            <button
              onClick={handleClose}
              className="px-6 py-3.5 bg-gray-800/80 text-gray-300 hover:text-white border border-gray-700/50 hover:bg-gray-700/60 rounded-xl text-sm font-bold transition-all text-center"
            >
              Dismiss
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 bg-black/60 hover:bg-brand-red text-gray-300 hover:text-white p-2.5 rounded-full border border-white/10 hover:border-brand-red/20 transition-all z-50 shadow-md"
          aria-label="Close Ad"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <style jsx global>{`
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scale-up {
          animation: scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default PopupAdModal;
