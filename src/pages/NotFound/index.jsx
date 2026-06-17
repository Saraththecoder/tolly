import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[70vh] text-center">
      <Helmet>
        <title>Page Not Found | Chithrambalare</title>
      </Helmet>

      <h1 className="text-9xl font-poppins font-black text-gray-200 mb-4">404</h1>
      <h2 className="text-3xl font-poppins font-bold text-white mb-4">Oops! Page not found</h2>
      <p className="text-gray-500 font-inter max-w-md mb-8">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <button 
          onClick={() => window.history.back()}
          className="flex items-center justify-center px-6 py-3 border border-gray-300 rounded-full font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Go Back
        </button>
        <Link 
          to="/"
          className="flex items-center justify-center px-6 py-3 bg-brand-red rounded-full font-semibold text-white hover:bg-red-700 transition-colors"
        >
          <Home className="w-5 h-5 mr-2" />
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
