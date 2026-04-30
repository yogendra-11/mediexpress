import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const handleLogout = () => { logout(); navigate('/login'); };

  const navLinks = {
    user: [
      { to: '/dashboard', label: 'Home', icon: '🏠' },
      { to: '/medicines', label: 'Medicines', icon: '💊' },
      { to: '/consultations', label: 'Consultations', icon: '📹' },
      { to: '/prescriptions', label: 'Prescriptions', icon: '📋' },
      { to: '/orders', label: 'My Orders', icon: '📦' },
    ],
    doctor: [
      { to: '/dashboard', label: 'Home', icon: '🏠' },
      { to: '/consultations', label: 'Consultations', icon: '📹' },
      { to: '/prescriptions', label: 'Prescriptions', icon: '📋' },
    ],
    pharmacy: [
      { to: '/dashboard', label: 'Home', icon: '🏠' },
      { to: '/prescriptions', label: 'Prescriptions', icon: '📋' },
      { to: '/orders', label: 'Orders', icon: '📦' },
    ],
    delivery: [
      { to: '/dashboard', label: 'Home', icon: '🏠' },
      { to: '/orders', label: 'Deliveries', icon: '🚴' },
    ],
  };

  const roleLabels = { user: 'Patient', doctor: 'Doctor', pharmacy: 'Pharmacy', delivery: 'Delivery' };
  const roleColors = { user: 'bg-blue-100 text-blue-700', doctor: 'bg-emerald-100 text-emerald-700', pharmacy: 'bg-amber-100 text-amber-700', delivery: 'bg-purple-100 text-purple-700' };

  return (
    <nav className="bg-white shadow-nav sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-practo-blue rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-practo-navy hidden sm:block">MediExpress</span>
          </Link>

          {/* Center Nav */}
          <div className="hidden md:flex items-center gap-1">
            {(navLinks[user.role] || []).map((link) => {
              const isActive = location.pathname === link.to || (link.to !== '/dashboard' && location.pathname.startsWith(link.to));
              return (
                <Link key={link.to} to={link.to}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${isActive ? 'bg-practo-blue-light text-practo-blue' : 'text-practo-gray hover:text-practo-navy hover:bg-gray-50'}`}>
                  <span className="mr-1.5">{link.icon}</span>{link.label}
                </Link>
              );
            })}
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${roleColors[user.role]}`}>
              {roleLabels[user.role]}
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-practo-blue flex items-center justify-center text-white text-sm font-bold">
                {user.name?.charAt(0)?.toUpperCase()}
              </div>
              <span className="text-sm font-medium text-practo-navy">{user.name}</span>
            </div>
            <button onClick={handleLogout} className="p-2 text-practo-gray hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Logout">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden flex items-center gap-1 pb-2 overflow-x-auto -mx-1 px-1">
          {(navLinks[user.role] || []).map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link key={link.to} to={link.to}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${isActive ? 'bg-practo-blue-light text-practo-blue' : 'text-practo-gray'}`}>
                {link.icon} {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
