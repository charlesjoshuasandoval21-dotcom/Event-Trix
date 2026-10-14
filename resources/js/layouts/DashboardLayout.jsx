import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { CalendarPlus, CalendarRange, ClipboardList, Compass, LayoutDashboard, Menu, Settings, Ticket } from 'lucide-react';
import DashboardSidebar from '../components/DashboardSidebar';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const NAV = {
  organizer: {
    title: 'Organizer',
    items: [
      { to: '/organizer', label: 'Overview', icon: LayoutDashboard, end: true },
      { to: '/organizer/events', label: 'Manage Events', icon: CalendarRange, end: true },
      { to: '/organizer/events/new', label: 'Create Event', icon: CalendarPlus },
      { to: '/organizer/registrations', label: 'Registrations', icon: ClipboardList },
      { to: '/organizer/settings', label: 'Settings', icon: Settings },
    ],
  },
  student: {
    title: 'Student',
    items: [
      { to: '/student', label: 'Overview', icon: LayoutDashboard, end: true },
      { to: '/events', label: 'Explore Events', icon: Compass },
      { to: '/student/registrations', label: 'My Registrations', icon: Ticket },
      { to: '/organizer/events', label: 'Manage Events', icon: CalendarRange, end: true },
      { to: '/organizer/events/new', label: 'Create Event', icon: CalendarPlus },
      { to: '/student/settings', label: 'Settings', icon: Settings },
    ],
  },
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const nav = NAV[user.role] || NAV.student;

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('You have been logged out.');
      navigate('/login');
    } catch {
      toast.error('Could not log out. Please try again.');
    }
  };

  return (
    <div className="dash min-h-screen">
      <DashboardSidebar
        items={nav.items}
        title={nav.title}
        open={open}
        onClose={() => setOpen(false)}
        user={user}
        onLogout={handleLogout}
      />

      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-navy-900/15 bg-white px-4 lg:hidden">
          <button onClick={() => setOpen(true)} className="p-2 text-navy-800 hover:bg-navy-50" aria-label="Open sidebar">
            <Menu className="h-5 w-5" />
          </button>
          <span className="eyebrow">{nav.title} console</span>
        </header>

        <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-10 lg:py-9">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
