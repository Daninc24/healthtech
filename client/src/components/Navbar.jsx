import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navLinkClass = (path) => {
    return `border-transparent text-gray-500 hover:border-blue-500 hover:text-blue-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
      isActive(path) ? 'border-blue-500 text-blue-600' : ''
    }`;
  };

  const mobileNavLinkClass = (path) => {
    return `block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
      isActive(path)
        ? 'border-blue-500 text-blue-600 bg-blue-50'
        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-blue-500 hover:text-blue-600'
    }`;
  };

  const getHomeLink = () => {
    if (user?.role === 'admin') {
      return '/admin/dashboard';
    } else if (user?.role === 'doctor') {
      return '/doctor/dashboard';
    } else if (user?.role === 'patient') {
      return '/patient/dashboard';
    }
    return '/';
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to={getHomeLink()} className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
                HealthTech
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link to={getHomeLink()} className={navLinkClass(getHomeLink())}>
                Home
              </Link>
              {!user && (
                <>
                  <Link to="/find-doctors" className={navLinkClass('/find-doctors')}>
                    Find Doctors
                  </Link>
                  <Link to="/services" className={navLinkClass('/services')}>
                    Services
                  </Link>
                  <Link to="/about" className={navLinkClass('/about')}>
                    About
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleLogout}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className={`text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/login') ? 'text-blue-600' : ''
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link to={getHomeLink()} className={mobileNavLinkClass(getHomeLink())}>
              Home
            </Link>
            {!user && (
              <>
                <Link to="/find-doctors" className={mobileNavLinkClass('/find-doctors')}>
                  Find Doctors
                </Link>
                <Link to="/services" className={mobileNavLinkClass('/services')}>
                  Services
                </Link>
                <Link to="/about" className={mobileNavLinkClass('/about')}>
                  About
                </Link>
              </>
            )}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            {user ? (
              <div className="space-y-1">
                <button
                  onClick={handleLogout}
                  className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-blue-500 hover:text-blue-600"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <Link to="/login" className={mobileNavLinkClass('/login')}>
                  Login
                </Link>
                <Link to="/register" className={mobileNavLinkClass('/register')}>
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 