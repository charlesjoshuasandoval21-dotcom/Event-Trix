import { Link } from 'react-router-dom';
import { CalendarCheck, GraduationCap, ShieldCheck } from 'lucide-react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function About() {
  useDocumentTitle('About');

  return (
    <div>
      <section className="bg-navy-950 py-14 text-white">
        <div className="container-page max-w-4xl">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">About Eventrix</h1>
          <p className="mt-3 text-lg text-navy-200">Where IT Events Happen.</p>
        </div>
      </section>

      <div className="container-page max-w-4xl py-12">
        <p className="text-lg leading-relaxed text-slate-700">
          Eventrix is a centralized event management and registration platform for a college IT department. It lets
          department organizers publish technology-related events and lets students discover them and register online —
          no scattered posts, no paper forms.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {[
            {
              icon: GraduationCap,
              title: 'For students',
              text: 'Browse hackathons, seminars, workshops and tournaments, register in seconds, and keep track of everything you joined.',
            },
            {
              icon: CalendarCheck,
              title: 'For organizers',
              text: 'Create and publish events, set capacity and deadlines, and see exactly who is attending.',
            },
            {
              icon: ShieldCheck,
              title: 'Fair & reliable',
              text: 'Deadlines and participant limits are enforced by the server, so seats are never oversold.',
            },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="card p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-electric-50 text-electric-600">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h2 className="text-lg font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
            </div>
          ))}
        </div>

        <p className="mt-10 text-sm text-slate-500">
          Eventrix is a school project and is not an officially endorsed institutional service.
        </p>

        <div className="mt-8 flex gap-3">
          <Link to="/events" className="btn-primary">
            Explore events
          </Link>
          <Link to="/register" className="btn-secondary">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
