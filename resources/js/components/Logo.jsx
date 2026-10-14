import { Link } from 'react-router-dom';

export function LogoMark({ className = 'h-9 w-9' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="14" fill="#2f6bff" />
      <path d="M20 18h26v7H29v6h14v7H29v6h17v7H20z" fill="#fff" />
    </svg>
  );
}

export default function Logo({ to = '/', dark = false, className = '' }) {
  return (
    <Link to={to} className={`inline-flex items-center gap-2.5 ${className}`} aria-label="Eventrix home">
      <LogoMark />
      <span className={`font-display text-xl font-bold tracking-tight ${dark ? 'text-white' : 'text-navy-900'}`}>
        Event<span className="text-electric-500">rix</span>
      </span>
    </Link>
  );
}
