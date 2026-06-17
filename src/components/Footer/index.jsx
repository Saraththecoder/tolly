import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-brand-dark text-white pt-16 pb-8">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="inline-block mb-6">
              <span className="text-3xl font-poppins font-bold tracking-tighter">
                <span className="text-brand-red">Tolly</span>Portal
              </span>
            </Link>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Your ultimate destination for the latest Tollywood news, unbiased movie reviews, exclusive interviews, and authentic box office collections.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-brand-red transition-colors text-white font-bold">
                F
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-brand-red transition-colors text-white font-bold">
                X
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-brand-red transition-colors text-white font-bold">
                I
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-brand-red transition-colors text-white font-bold">
                Y
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-poppins font-semibold mb-6 border-b border-gray-700 pb-2">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link to="/movie-news" className="text-gray-400 hover:text-white transition-colors">Movie News</Link></li>
              <li><Link to="/reviews" className="text-gray-400 hover:text-white transition-colors">Movie Reviews</Link></li>
              <li><Link to="/box-office" className="text-gray-400 hover:text-white transition-colors">Box Office</Link></li>
              <li><Link to="/movie-news/archive" className="text-gray-400 hover:text-white transition-colors">A-Z Directory</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-poppins font-semibold mb-6 border-b border-gray-700 pb-2">Categories</h3>
            <ul className="space-y-3">
              <li><Link to="/movie-news?category=Tollywood" className="text-gray-400 hover:text-white transition-colors">Tollywood</Link></li>
              <li><Link to="/movie-news?category=Bollywood" className="text-gray-400 hover:text-white transition-colors">Bollywood</Link></li>
              <li><Link to="/movie-news?category=OTT" className="text-gray-400 hover:text-white transition-colors">OTT Updates</Link></li>
              <li><Link to="/movie-news?category=Interviews" className="text-gray-400 hover:text-white transition-colors">Interviews</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-poppins font-semibold mb-6 border-b border-gray-700 pb-2">Company</h3>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} TollyPortal. All rights reserved.
          </p>
          <p className="text-gray-500 text-sm">
            Designed with <span className="text-brand-red">♥</span> for Cinema Lovers
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
