import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';
import Logo from './Logo';

export default function DashboardSidebar({ items, open, onClose, user, onLogout, title }) {
  const content = (
    <div className="flex h-full flex-col border-r border-navy-900/15 bg-white">
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-navy-900/10 px-5">
        <Logo to="/" />
        <button className="p-1.5 text-navy-600 hover:bg-navy-50 lg:hidden" onClick={onClose} aria-label="Close sidebar">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="border-b border-navy-900/10 px-5 py-3">
        <p className="eyebrow">{title} console</p>
      </div>

      <nav className="flex-1 overflow-y-auto py-3" aria-label={`${title} navigation`}>
        {items.map(({ to, label, end, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onClose}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 px-5 py-3 text-[15px] transition ${
                isActive
                  ? 'bg-navy-900 font-semibold text-white'
                  : 'text-navy-700 hover:bg-navy-50 hover:text-navy-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && <span className="absolute inset-y-0 left-0 w-1 bg-electric-500" />}
                <Icon className={`h-[18px] w-[18px] shrink-0 self-center ${isActive ? 'text-electric-300' : 'text-navy-400'}`} aria-hidden="true" />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-navy-900/10 p-5">
        <p className="eyebrow">Signed in</p>
        <p className="mt-1.5 truncate text-sm font-semibold text-navy-900">{user?.name}</p>
        <p className="truncate font-mono text-[11px] text-slate-500">{user?.email}</p>
        <button
          onClick={onLogout}
          className="mt-4 w-full border border-navy-900/20 px-3 py-2 text-left font-mono text-xs uppercase tracking-wider text-navy-800 transition hover:border-navy-900 hover:bg-navy-900 hover:text-white"
        >
          Log out →
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 lg:block">{content}</aside>

      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-navy-950/50" onClick={onClose} />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] animate-toast-in">{content}</aside>
        </div>
      )}
    </>
  );
}
