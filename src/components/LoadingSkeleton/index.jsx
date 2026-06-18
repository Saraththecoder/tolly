const LoadingSkeleton = ({ type = 'page' }) => {
  if (type === 'page') {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-brand-red rounded-full animate-spin"></div>
        <p className="text-gray-100/60 font-inter font-medium">Loading...</p>
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className="flex flex-col bg-white rounded-xl shadow-sm border border-brand-red/10 overflow-hidden animate-pulse">
        <div className="w-full h-48 bg-gray-200"></div>
        <div className="p-4 space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-6 bg-gray-200 rounded w-full"></div>
          <div className="h-6 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-20 bg-gray-200 animate-pulse rounded"></div>
  );
};

export default LoadingSkeleton;


