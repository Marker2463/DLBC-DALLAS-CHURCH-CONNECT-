import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useAuth } from '../../lib/AuthContext';

interface NavItem {
  name: string;
  path: string;
}

const publicNav: NavItem[] = [
  { name: 'Ministry', path: '/ministry-guidelines' },
  { name: 'Leadership', path: '/leadership' },
  { name: 'Process', path: '/process' },
  { name: 'Resources', path: '/resources' },
];

const memberNav: NavItem[] = [
  { name: 'Dashboard', path: '/member/dashboard' },
  { name: 'Request Consultation', path: '/member/request' },
  { name: 'Consultations', path: '/member/sanctuary' }
];

const leaderNav: NavItem[] = [
  { name: 'Leader Dashboard', path: '/leader/dashboard' },
  { name: 'Availability', path: '/pastor/availability' },
  { name: 'Consultations', path: '/pastor/sanctuary' },
  { name: 'Records', path: '/pastor/archives' }
];

const pastorNav: NavItem[] = [
  { name: 'Pastor Dashboard', path: '/pastor/dashboard' },
  { name: 'Availability', path: '/pastor/availability' },
  { name: 'Consultations', path: '/pastor/sanctuary' },
  { name: 'Records', path: '/pastor/archives' }
];

const adminNav: NavItem[] = [
  { name: 'Leadership Assignments', path: '/admin/roles' },
];

export function TopNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, role, user, logout } = useAuth();

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  const isAdmin = user?.email === 'markeroladipo@gmail.com' || role === 'admin';
  const isPastor = role === 'pastor';
  const isLeader = role === 'leader';

  const activeMenu = !isAuthenticated 
    ? publicNav 
    : (isAdmin ? adminNav : (isPastor ? pastorNav : (isLeader ? leaderNav : memberNav)));

  return (
    <header className="w-full bg-background border-b border-[#ebdcd0] fixed top-0 left-0 right-0 z-50 px-8 h-20 flex items-center justify-between">
      {/* Brand Identification Logo */}
      <Link 
        to={isAuthenticated ? (isAdmin ? "/admin/roles" : (isPastor ? "/pastor/dashboard" : (isLeader ? "/leader/dashboard" : "/member/dashboard"))) : "/"} 
        className="font-serif text-xl font-bold text-[#1c202e] tracking-tight transition-opacity hover:opacity-90"
      >
        DLBC Church Connect
      </Link>

      {/* Structured Linear Workflows */}
      <nav className="hidden md:flex items-center space-x-8 h-full relative">
        {activeMenu.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path + '/'));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "relative flex items-center h-full font-sans text-sm font-medium transition-colors duration-300 px-1",
                isActive ? "text-[#1c202e] font-semibold" : "text-primary/70 hover:text-[#b93c3c]"
              )}
            >
              {item.name}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#b93c3c]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Identity State Actions Panel */}
      <div className="flex items-center space-x-4">
        {!isAuthenticated ? (
          <Link to="/auth/login" className="bg-[#1c202e] text-white text-xs font-semibold px-5 py-2.5 rounded shadow-sm hover:bg-opacity-90 transition-all tracking-wider uppercase font-sans">
            Begin Consultation
          </Link>
        ) : (
          <button onClick={handleSignOut} className="text-xs font-semibold tracking-wider text-[#b93c3c] uppercase hover:underline font-sans cursor-pointer">
            Log Out
          </button>
        )}
      </div>
    </header>
  );
}
