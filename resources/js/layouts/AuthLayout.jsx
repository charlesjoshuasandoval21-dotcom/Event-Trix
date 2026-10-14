import Logo from '../components/Logo';
import { Link } from 'react-router-dom';
import { CalendarCheck, Code2, Trophy } from 'lucide-react';

export default function AuthLayout({ title, subtitle, footer, children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.05fr]">
      <div className="flex flex-col px-5 py-8 sm:px-10">
        <Logo />
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <p className="mt-6 text-center text-sm text-slate-600">{footer}</p>
        </div>
        <Link to="/" className="text-center text-xs text-slate-500 hover:text-electric-700">
          ← Back to Eventrix
        </Link>
      </div>

      <div className="relative hidden overflow-hidden bg-navy-950 lg:block">
        <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:44px_44px]" />
        <div className="absolute -right-24 top-1/4 h-96 w-96 rounded-full bg-electric-600/30 blur-[120px]" />
        <div className="relative flex h-full flex-col justify-center p-16 text-white">
          <p className="text-sm font-semibold uppercase tracking-widest text-electric-400">Where IT Events Happen.</p>
          <h2 className="mt-4 max-w-md text-4xl font-extrabold leading-tight text-white">
            Your next hackathon is one click away.
          </h2>
          <ul className="mt-10 space-y-5">
            {[
              { icon: Code2, text: 'Hackathons, workshops & seminars from your IT department' },
              { icon: CalendarCheck, text: 'Register in seconds and manage your seats' },
              { icon: Trophy, text: 'Competitions and esports tournaments' },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-4 text-navy-100">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <Icon className="h-5 w-5 text-electric-400" aria-hidden="true" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
