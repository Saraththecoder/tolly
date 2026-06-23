import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { 
  Image as ImageIcon, 
  Search, 
  Download, 
  Copy, 
  ExternalLink, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  SlidersHorizontal,
  Check, 
  Info, 
  AlertTriangle,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { extractImages } from '../../services/api';

const ImageExtractor = ({ embedMode = false }) => {
  const [urlInput, setUrlInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  
  // Scraped images state enriched with dimensions after loading in DOM
  const [images, setImages] = useState([]);
  const [imageSizes, setImageSizes] = useState({}); // { url: { width, height } }
  
  // Filtering & Sorting states
  const [searchText, setSearchText] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [sizeFilter, setSizeFilter] = useState('all'); // all, large (>=400), medium (150-400), small (<=150)
  const [sortBy, setSortBy] = useState('default'); // default, width-desc, height-desc
  
  // Selection states
  const [selectedUrls, setSelectedUrls] = useState(new Set());
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedId, setCopiedId] = useState(null); // tracking individual copy animation

  // Lightbox state
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // Form submission handler
  const handleScan = async (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setIsScanning(true);
    setError(null);
    setScanResult(null);
    setImages([]);
    setImageSizes({});
    setSelectedUrls(new Set());

    try {
      const data = await extractImages(urlInput);
      if (data.success) {
        setScanResult(data);
        setImages(data.images || []);
      } else {
        setError(data.error || 'Failed to extract images.');
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error || 
        'An error occurred while fetching the website. Please check the URL and try again.'
      );
    } finally {
      setIsScanning(false);
    }
  };

  // Image load handler to measure dimension dynamically in browser
  const handleImageLoad = (imageUrl, width, height) => {
    setImageSizes(prev => ({
      ...prev,
      [imageUrl]: { width, height }
    }));
  };

  // Copy URL action
  const handleCopyUrl = (url, id) => {
    let urlToCopy = url;
    if (url.includes('/api/image-proxy?url=')) {
      try {
        const raw = url.split('/api/image-proxy?url=')[1];
        const decoded = decodeURIComponent(raw);
        if (/^https?:\/\//i.test(decoded)) {
          urlToCopy = decoded;
        } else {
          urlToCopy = atob(decoded);
        }
      } catch (e) {
        console.error('Failed to decode proxied URL', e);
      }
    }
    navigator.clipboard.writeText(urlToCopy);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Bulk copy URLs
  const handleCopyAll = (urlsToCopy) => {
    if (urlsToCopy.length === 0) return;
    const cleaned = urlsToCopy.map(url => {
      if (url.includes('/api/image-proxy?url=')) {
        try {
          const raw = url.split('/api/image-proxy?url=')[1];
          const decoded = decodeURIComponent(raw);
          if (/^https?:\/\//i.test(decoded)) {
            return decoded;
          } else {
            return atob(decoded);
          }
        } catch (e) {
          return url;
        }
      }
      return url;
    });
    navigator.clipboard.writeText(cleaned.join('\n'));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  // Download image via blob fetch (handles trigger download dialog)
  const handleDownload = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || 'downloaded-image';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      // Fallback for CORS block
      window.open(url, '_blank');
    }
  };

  // Selection toggle
  const toggleSelect = (url) => {
    setSelectedUrls(prev => {
      const next = new Set(prev);
      if (next.has(url)) {
        next.delete(url);
      } else {
        next.add(url);
      }
      return next;
    });
  };

  const selectAllFiltered = (filteredImages) => {
    setSelectedUrls(new Set(filteredImages.map(img => img.url)));
  };

  const clearSelection = () => {
    setSelectedUrls(new Set());
  };

  // Filter & Sort Logic
  const filteredAndSortedImages = images
    .filter(img => {
      // 1. Text filter (Alt text or URL path)
      const altMatch = img.alt?.toLowerCase().includes(searchText.toLowerCase());
      const filenameMatch = img.url.split('/').pop().toLowerCase().includes(searchText.toLowerCase());
      if (searchText && !altMatch && !filenameMatch) return false;

      // 2. Source filter
      if (sourceFilter !== 'all' && img.source !== sourceFilter) return false;

      // 3. Size filter (uses the dynamic measured sizes)
      const size = imageSizes[img.url];
      if (sizeFilter !== 'all') {
        if (!size) return false; // Hide until measured if filtering by size
        const maxDim = Math.max(size.width, size.height);
        if (sizeFilter === 'large' && maxDim < 400) return false;
        if (sizeFilter === 'medium' && (maxDim < 150 || maxDim >= 400)) return false;
        if (sizeFilter === 'small' && maxDim >= 150) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'width-desc') {
        const sizeA = imageSizes[a.url]?.width || 0;
        const sizeB = imageSizes[b.url]?.width || 0;
        return sizeB - sizeA;
      }
      if (sortBy === 'height-desc') {
        const sizeA = imageSizes[a.url]?.height || 0;
        const sizeB = imageSizes[b.url]?.height || 0;
        return sizeB - sizeA;
      }
      return 0; // Default order from API
    });

  // Source distribution calculations
  const stats = {
    total: images.length,
    meta: images.filter(img => img.source === 'Meta Tag').length,
    content: images.filter(img => img.source === 'Page Content').length,
    background: images.filter(img => img.source === 'CSS Background').length,
    linked: images.filter(img => img.source === 'Linked Image').length,
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxIndex === null) return;
      if (e.key === 'ArrowRight') {
        setLightboxIndex(prev => (prev + 1) % filteredAndSortedImages.length);
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex(prev => (prev - 1 + filteredAndSortedImages.length) % filteredAndSortedImages.length);
      } else if (e.key === 'Escape') {
        setLightboxIndex(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, filteredAndSortedImages]);

  return (
    <div className={embedMode ? "w-full" : "container mx-auto px-4 lg:px-8 py-8 max-w-7xl min-h-[85vh]"}>
      {!embedMode && (
        <Helmet>
          <title>Visual Image Extractor | CHITRAMBHALARE</title>
        </Helmet>
      )}

      {/* Page Header */}
      {!embedMode && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-brand-red/20 pb-6 mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-brand-red font-bold uppercase tracking-wider mb-1">
              <Link to="/" className="hover:text-yellow-500 transition-colors">Home</Link>
              <span>/</span>
              <span>Image Extraper</span>
            </div>
            <h1 className="text-3xl font-poppins font-bold text-gray-100 flex items-center gap-2.5">
              <ImageIcon className="w-8 h-8 text-brand-red" />
              Image Extractor
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Scrape, download, and catalog images from any webpage. Perfect for media assets and stills archives.
            </p>
          </div>
        </div>
      )}

      {/* Scan URL Form Panel */}
      <div className="bg-[#131a2b]/80 backdrop-blur-xl border border-brand-red/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden mb-8">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-brand-red/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <form onSubmit={handleScan} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full flex flex-col gap-2">
            <label htmlFor="targetUrl" className="text-xs text-gray-400 font-bold uppercase tracking-wider pl-1">
              Enter Target URL to Crawl
            </label>
            <input
              id="targetUrl"
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="w-full bg-[#1a2235] border border-gray-800 text-gray-100 px-5 py-3.5 rounded-xl focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none text-sm transition-all placeholder:text-gray-600"
              placeholder="e.g. https://tracktollywood.com/box-office-news"
              required
              disabled={isScanning}
            />
          </div>
          <button
            type="submit"
            disabled={isScanning}
            className="w-full md:w-auto bg-brand-red hover:bg-brand-red/90 text-white font-bold px-8 py-3.5 rounded-xl text-sm transition-all shadow-[0_0_20px_rgba(212,43,43,0.3)] disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {isScanning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Scanning Webpage...
              </>
            ) : (
              'Extract Images'
            )}
          </button>
        </form>

        {/* Loading Radar Overlay */}
        {isScanning && (
          <div className="mt-6 p-8 border border-brand-red/20 rounded-xl bg-brand-red/5 flex flex-col items-center justify-center text-center animate-pulse">
            <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-brand-red animate-ping opacity-75"></div>
              <div className="absolute w-12 h-12 rounded-full border-2 border-brand-red/40 animate-spin border-t-brand-red"></div>
              <ImageIcon className="w-6 h-6 text-brand-red" />
            </div>
            <h3 className="font-poppins font-bold text-gray-200">Analyzing Remote Document</h3>
            <p className="text-gray-400 text-xs mt-1 max-w-sm">
              Connecting, fetching HTML content, and parsing tag nodes to isolate media resources...
            </p>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mt-6 bg-red-950/40 border border-brand-red/30 text-brand-red p-4 rounded-xl flex items-start gap-3 shadow-lg">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm">Crawl Failed</h4>
              <p className="text-xs text-red-300 mt-0.5 leading-relaxed">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Scrape Result Output */}
      {scanResult && (
        <div className="space-y-6">
          
          {/* Results Summary Card */}
          <div className="bg-[#131a2b]/40 border border-gray-800 rounded-2xl p-5 flex flex-col lg:flex-row justify-between gap-6 items-start lg:items-center">
            <div>
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Scraped Site</div>
              <h2 className="text-xl font-poppins font-bold text-gray-200 mt-0.5 truncate max-w-xl">
                {scanResult.title}
              </h2>
              <a 
                href={scanResult.url} 
                target="_blank" 
                rel="noreferrer" 
                className="text-xs text-yellow-500 hover:underline flex items-center gap-1 mt-1 font-medium"
              >
                {scanResult.url} <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 w-full lg:w-auto">
              <div className="bg-[#1a2235] border border-gray-800/80 px-4 py-2.5 rounded-xl text-center">
                <div className="text-xs font-bold text-brand-red">{stats.total}</div>
                <div className="text-[9px] text-gray-500 uppercase mt-0.5">Found</div>
              </div>
              <div className="bg-[#1a2235] border border-gray-800/80 px-4 py-2.5 rounded-xl text-center">
                <div className="text-xs font-bold text-blue-400">{stats.meta}</div>
                <div className="text-[9px] text-gray-500 uppercase mt-0.5">Meta</div>
              </div>
              <div className="bg-[#1a2235] border border-gray-800/80 px-4 py-2.5 rounded-xl text-center">
                <div className="text-xs font-bold text-emerald-400">{stats.content}</div>
                <div className="text-[9px] text-gray-500 uppercase mt-0.5">Content</div>
              </div>
              <div className="bg-[#1a2235] border border-gray-800/80 px-4 py-2.5 rounded-xl text-center">
                <div className="text-xs font-bold text-amber-500">{stats.background}</div>
                <div className="text-[9px] text-gray-500 uppercase mt-0.5">CSS BG</div>
              </div>
              <div className="bg-[#1a2235] border border-gray-800/80 px-4 py-2.5 rounded-xl text-center">
                <div className="text-xs font-bold text-purple-400">{stats.linked}</div>
                <div className="text-[9px] text-gray-500 uppercase mt-0.5">Links</div>
              </div>
            </div>
          </div>

          {/* Filtering and Search Panel */}
          <div className="bg-[#131a2b]/80 border border-gray-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              
              {/* Text Search */}
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Filter by title/filename..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full bg-[#1a2235] border border-gray-850 text-gray-200 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:border-brand-red outline-none transition-all placeholder:text-gray-600"
                />
              </div>

              {/* Advanced Filter Buttons / Controls */}
              <div className="flex flex-wrap items-center gap-3.5 w-full md:w-auto">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-xs text-gray-400 font-bold uppercase">Source:</span>
                  <select
                    value={sourceFilter}
                    onChange={(e) => setSourceFilter(e.target.value)}
                    className="bg-[#1a2235] border border-gray-800 px-3 py-2 rounded-xl text-xs text-gray-200 focus:border-brand-red outline-none"
                  >
                    <option value="all">All Sources</option>
                    <option value="Meta Tag">Meta Tags Only</option>
                    <option value="Page Content">Page Content (img)</option>
                    <option value="CSS Background">Backgrounds (CSS)</option>
                    <option value="Linked Image">Direct Links</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 font-bold uppercase">Min Size:</span>
                  <select
                    value={sizeFilter}
                    onChange={(e) => setSizeFilter(e.target.value)}
                    className="bg-[#1a2235] border border-gray-800 px-3 py-2 rounded-xl text-xs text-gray-200 focus:border-brand-red outline-none"
                  >
                    <option value="all">Any Size</option>
                    <option value="large">Large Stills (&gt;=400px)</option>
                    <option value="medium">Medium Stills (150px - 400px)</option>
                    <option value="small">Small Icons (&lt;=150px)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 font-bold uppercase">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-[#1a2235] border border-gray-800 px-3 py-2 rounded-xl text-xs text-gray-200 focus:border-brand-red outline-none"
                  >
                    <option value="default">Default Order</option>
                    <option value="width-desc">Width (High to Low)</option>
                    <option value="height-desc">Height (High to Low)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Selection / Bulk Actions Toolbar */}
            <div className="border-t border-gray-800/80 pt-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="text-xs text-gray-400 font-medium">
                Showing <span className="font-bold text-gray-200">{filteredAndSortedImages.length}</span> of {images.length} images.
                {selectedUrls.size > 0 && (
                  <span className="ml-1 bg-brand-red/10 border border-brand-red/20 text-brand-red px-2 py-0.5 rounded-full font-bold">
                    {selectedUrls.size} selected
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyAll(filteredAndSortedImages.map(img => img.url))}
                  className="bg-brand-surface border border-gray-800 hover:border-gray-700 hover:text-white text-gray-300 px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  {copiedAll ? <Check className="w-3.5 h-3.5 text-green-500 animate-scale" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedAll ? 'URLs Copied!' : 'Copy Filtered URLs'}
                </button>

                {selectedUrls.size > 0 ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleCopyAll(Array.from(selectedUrls))}
                      className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 hover:bg-yellow-500 hover:text-navy px-3 py-2 rounded-xl text-xs font-bold transition-all"
                    >
                      Copy Selected URLs ({selectedUrls.size})
                    </button>
                    <button
                      type="button"
                      onClick={clearSelection}
                      className="bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white px-3 py-2 rounded-xl text-xs font-bold transition-all"
                    >
                      Clear Selection
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => selectAllFiltered(filteredAndSortedImages)}
                    className="bg-brand-surface border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white px-3 py-2 rounded-xl text-xs font-bold transition-all"
                  >
                    Select All Filtered
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Empty Grid State */}
          {filteredAndSortedImages.length === 0 && (
            <div className="text-center py-20 bg-[#131a2b]/20 border border-dashed border-gray-800 rounded-2xl">
              <ImageIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <h3 className="font-poppins font-bold text-gray-400">No Matching Images Found</h3>
              <p className="text-gray-500 text-xs mt-1">Adjust your search keyword, source type, or minimum size filters.</p>
            </div>
          )}

          {/* Interactive Image Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredAndSortedImages.map((img, idx) => {
              const filename = img.url.split('/').pop().split('?')[0] || 'scraped-image';
              const size = imageSizes[img.url];
              const isSelected = selectedUrls.has(img.url);
              const isCopied = copiedId === idx;
              
              // Color coding source badges
              const sourceColors = {
                'Meta Tag': 'bg-blue-950/65 text-blue-400 border-blue-500/20',
                'Page Content': 'bg-red-950/65 text-brand-red border-brand-red/20',
                'CSS Background': 'bg-amber-950/65 text-amber-500 border-amber-500/20',
                'Linked Image': 'bg-purple-950/65 text-purple-400 border-purple-500/20',
              };
              const badgeClass = sourceColors[img.source] || 'bg-gray-850 text-gray-400 border-gray-700';

              return (
                <div 
                  key={idx} 
                  className={`bg-[#131a2b]/80 border rounded-2xl overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)] transition-all duration-300 relative flex flex-col ${
                    isSelected ? 'border-yellow-500 shadow-[0_0_15px_rgba(245,200,66,0.15)]' : 'border-gray-850 hover:border-gray-700'
                  }`}
                >
                  {/* Selection Checkbox */}
                  <div className="absolute top-3 left-3 z-10">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(img.url)}
                      className="w-4.5 h-4.5 rounded cursor-pointer accent-yellow-500 border-gray-800 bg-[#1a2235]"
                    />
                  </div>

                  {/* Image Display Area */}
                  <div 
                    className="h-48 overflow-hidden bg-black/40 flex items-center justify-center relative cursor-pointer"
                    onClick={() => setLightboxIndex(idx)}
                  >
                    <img 
                      src={img.url} 
                      alt={img.alt} 
                      onLoad={(e) => handleImageLoad(img.url, e.target.naturalWidth, e.target.naturalHeight)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />

                    {/* Dark overlay on hover */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setLightboxIndex(idx); }}
                        className="p-2.5 bg-brand-surface border border-gray-750 text-gray-200 hover:text-white rounded-xl text-xs font-bold transition-all hover:bg-brand-red hover:border-brand-red flex items-center justify-center"
                        title="View Full Resolution Lightbox"
                      >
                        <ImageIcon className="w-4.5 h-4.5" />
                      </button>
                    </div>

                    {/* Size tag badge */}
                    <div className="absolute bottom-2.5 right-2.5 bg-black/70 backdrop-blur-md text-[10px] font-bold text-gray-300 px-2.5 py-1 rounded-lg">
                      {size ? `${size.width} × ${size.height} px` : 'Measuring...'}
                    </div>
                  </div>

                  {/* Metadata and Actions */}
                  <div className="p-4 flex-grow flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${badgeClass}`}>
                          {img.source}
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-gray-200 line-clamp-2 leading-relaxed" title={img.alt}>
                        {img.alt || filename}
                      </h4>
                      <p className="text-[10px] text-gray-500 truncate select-all" title={img.url}>
                        {img.url}
                      </p>
                    </div>

                    {/* Actions panel */}
                    <div className="flex gap-2 pt-4 mt-3 border-t border-gray-850">
                      <button
                        type="button"
                        onClick={() => handleCopyUrl(img.url, idx)}
                        className="flex-1 bg-brand-surface hover:bg-[#1f2940] border border-gray-800 text-gray-300 hover:text-white py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                        title="Copy image URL to clipboard"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-green-500 animate-scale" /> : <Copy className="w-3.5 h-3.5" />}
                        {isCopied ? 'Copied' : 'Copy'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownload(img.url, filename)}
                        className="flex-1 bg-brand-surface hover:bg-brand-red text-gray-300 hover:text-white border border-gray-850 hover:border-brand-red py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                        title="Download image file to local storage"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lightbox Overlay Modal */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-[9999] bg-black/95 flex flex-col justify-between p-4 md:p-6 backdrop-blur-md">
          {/* Lightbox Topbar */}
          <div className="flex justify-between items-center w-full z-20">
            <div className="text-xs md:text-sm font-bold text-gray-400">
              Image <span className="text-white">{lightboxIndex + 1}</span> of {filteredAndSortedImages.length}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleCopyUrl(filteredAndSortedImages[lightboxIndex].url, 'lightbox')}
                className="bg-brand-surface border border-gray-800 hover:border-gray-700 text-gray-300 hover:text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Copy className="w-3.5 h-3.5" /> Copy Link
              </button>
              <button
                type="button"
                onClick={() => handleDownload(
                  filteredAndSortedImages[lightboxIndex].url, 
                  filteredAndSortedImages[lightboxIndex].url.split('/').pop().split('?')[0]
                )}
                className="bg-brand-red text-white hover:bg-brand-red/90 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5" /> Download
              </button>
              <button
                type="button"
                onClick={() => setLightboxIndex(null)}
                className="bg-gray-850 hover:bg-gray-750 text-gray-400 hover:text-white p-2 rounded-full transition-all border border-gray-750"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Lightbox Center Display */}
          <div className="relative flex-grow flex items-center justify-center min-h-0 py-4">
            
            {/* Left navigation */}
            <button
              type="button"
              onClick={() => setLightboxIndex(prev => (prev - 1 + filteredAndSortedImages.length) % filteredAndSortedImages.length)}
              className="absolute left-2 md:left-4 z-10 bg-black/60 hover:bg-brand-red text-gray-400 hover:text-white p-3 rounded-full transition-all border border-gray-800"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Actual image */}
            <div className="max-w-[90vw] max-h-[75vh] flex flex-col items-center select-none">
              <img 
                src={filteredAndSortedImages[lightboxIndex].url} 
                alt={filteredAndSortedImages[lightboxIndex].alt}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl border border-gray-800/50"
              />
            </div>

            {/* Right navigation */}
            <button
              type="button"
              onClick={() => setLightboxIndex(prev => (prev + 1) % filteredAndSortedImages.length)}
              className="absolute right-2 md:right-4 z-10 bg-black/60 hover:bg-brand-red text-gray-400 hover:text-white p-3 rounded-full transition-all border border-gray-800"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Lightbox Footer Details */}
          <div className="text-center pb-4 max-w-2xl mx-auto space-y-2 z-20">
            <h3 className="text-lg font-bold text-gray-100 truncate">
              {filteredAndSortedImages[lightboxIndex].alt || 'Extracted Image Stills'}
            </h3>
            <p className="text-xs text-gray-400 truncate max-w-md mx-auto select-all">
              {filteredAndSortedImages[lightboxIndex].url}
            </p>
            <div className="flex justify-center gap-3.5 text-[10px] text-gray-500 font-bold uppercase">
              <span>Source: {filteredAndSortedImages[lightboxIndex].source}</span>
              <span>•</span>
              <span>
                Size: {imageSizes[filteredAndSortedImages[lightboxIndex].url] 
                  ? `${imageSizes[filteredAndSortedImages[lightboxIndex].url].width} × ${imageSizes[filteredAndSortedImages[lightboxIndex].url].height} px` 
                  : 'Measuring...'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageExtractor;
