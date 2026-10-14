import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, Menu, X } from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/events', label: 'Explore Events' },
  { to: '/about', label: 'About' },
];

export default function Navbar() {
  const { user, isAuthenticated, homePath, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('You have been logged out.');
      navigate('/');
    } catch {
      toast.error('Could not log out. Please try again.');
    }
  };

  const linkClass = ({ isActive }) =>
    `rounded-md px-3 py-2 text-sm font-medium transition ${
      isActive ? 'text-white' : 'text-navy-200 hover:text-white'
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-navy-950/90 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between">
        <Logo dark />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              {({ isActive }) => (
                <span className="relative">
                  {l.label}
                  {isActive && <span className="absolute -bottom-1.5 left-0 right-0 h-0.5 rounded bg-electric-500" />}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated ? (
            <>
              <Link to={homePath} className="btn-primary btn-sm">
                <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                {user.role === 'organizer' ? 'Organizer Dashboard' : 'My Dashboard'}
              </Link>
              <button
                onClick={handleLogout}
                className="btn btn-sm text-navy-200 hover:bg-white/10 hover:text-white"
                aria-label="Log out"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-sm text-navy-100 hover:bg-white/10 hover:text-white">
                Login
              </Link>
              <Link to="/register" className="btn-primary btn-sm">
                Get Started
              </Link>
            </>
          )}
        </div>

        <button
          className="rounded-md p-2 text-white hover:bg-white/10 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div id="mobile-menu" className="border-t border-white/10 bg-navy-950 md:hidden">
          <nav className="container-page flex flex-col gap-1 py-3" aria-label="Mobile">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2.5 text-sm font-medium ${isActive ? 'bg-white/10 text-white' : 'text-navy-200'}`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-white/10 pt-3">
              {isAuthenticated ? (
                <>
                  <Link to={homePath} className="btn-primary">
                    <LayoutDashboard className="h-4 w-4" /> Go to dashboard
                  </Link>
                  <button onClick={handleLogout} className="btn border border-white/20 text-white hover:bg-white/10">
                    <LogOut className="h-4 w-4" /> Log out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn border border-white/20 text-white hover:bg-white/10">
                    Login
                  </Link>
                  <Link to="/register" className="btn-primary">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
