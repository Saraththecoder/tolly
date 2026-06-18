import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, Search, User } from 'lucide-react';
import logoImg from '../../assets/logo.png';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Movie News', path: '/movie-news' },
    { name: 'Reviews', path: '/reviews' },
    { name: 'Box Office', path: '/box-office' },
    { name: 'About Us', path: '/about' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-brand-dark/80 backdrop-blur-lg border-b border-brand-red/20 shadow-lg">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src={logoImg} alt="CHITRAMBHALARE Logo" className="h-16 w-auto object-contain" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `text-sm font-medium font-inter uppercase tracking-wide transition-colors ${
                    isActive ? 'text-brand-red glow-red' : 'text-gray-400 hover:text-gray-100'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/search" className="text-gray-400 hover:text-brand-red transition-colors">
              <Search className="w-5 h-5" />
            </Link>
            <button className="text-gray-400 hover:text-brand-red transition-colors">
              <User className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-400 hover:text-brand-red focus:outline-none"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-brand-dark/95 backdrop-blur-xl border-t border-brand-red/20">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-base font-medium ${
                    isActive
                      ? 'text-brand-red bg-brand-red/10'
                      : 'text-gray-400 hover:text-gray-100 hover:bg-white/5'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
            <Link
              to="/search"
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-gray-100 hover:bg-white/5 flex items-center space-x-2"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
