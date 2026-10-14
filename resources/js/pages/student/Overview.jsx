import { Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import StatStrip from '../../components/DashboardStatCard';
import EventStatusBadge from '../../components/EventStatusBadge';
import { ErrorState } from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useApi } from '../../hooks/useApi';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { registrationService } from '../../services/eventService';
import { useAuth } from '../../context/AuthContext';
import { dayOfMonth, formatDate, formatTime, monthShort, weekdayShort } from '../../utils/format';

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};

export default function Overview() {
  useDocumentTitle('My dashboard');
  const { user } = useAuth();
  const { data, loading, error, reload } = useApi(() => registrationService.dashboard(), []);

  if (loading && !data) return <LoadingSpinner label="Loading dashboard…" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const { stats } = data;
  const today = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());

  return (
    <>
      <PageHeader
        eyebrow={`Student / Overview · ${today}`}
        title={`${greeting()}, ${user.name.split(' ')[0]}.`}
        actions={
          <Link to="/events" className="btn-primary">
            Find events →
          </Link>
        }
      />

      <nav aria-label="Quick actions" className="mb-6 grid grid-cols-2 gap-px border border-navy-900/20 bg-navy-900/20 lg:grid-cols-4">
        {[
          { to: "/organizer/events/new", t: "Create", d: "Add a new event" },
          { to: "/organizer/events", t: "Manage", d: "View, edit, publish, delete" },
          { to: "/events", t: "Explore", d: "Find events to join" },
          { to: "/student/registrations", t: "My registrations", d: "Your seats" },
        ].map((a) => (
          <Link key={a.to} to={a.to} className="group bg-white p-4 transition hover:bg-navy-900">
            <p className="font-display text-base font-bold text-navy-900 group-hover:text-white">{a.t} →</p>
            <p className="mt-0.5 font-mono text-[11px] text-slate-500 group-hover:text-navy-200">{a.d}</p>
          </Link>
        ))}
      </nav>

      <StatStrip
        cells={[
          { label: 'Active registrations', value: stats.active_registrations, hint: 'seats you hold', accent: true },
          { label: 'Upcoming', value: stats.upcoming_events, hint: 'still to attend' },
          { label: 'Completed', value: stats.completed_events, hint: 'events you attended' },
        ]}
      />

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <section className="panel">
          <div className="panel-head">
            <h2 className="text-base font-semibold">Your next events</h2>
            <Link to="/student/registrations" className="font-mono text-xs uppercase tracking-wider text-electric-700 hover:underline">
              All registrations →
            </Link>
          </div>
          {data.upcoming.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="font-mono text-xs text-slate-500">NOTHING ON YOUR CALENDAR</p>
              <Link to="/events" className="btn-primary btn-sm mt-4">
                Browse events
              </Link>
            </div>
          ) : (
            <ol className="divide-y divide-navy-900/10">
              {data.upcoming.map((r) => (
                <li key={r.id}>
                  <Link
                    to={`/events/${r.event.id}`}
                    className="grid grid-cols-[64px_1fr] gap-4 px-5 py-4 transition hover:bg-electric-50/60 sm:grid-cols-[72px_1fr_auto]"
                  >
                    <div className="border-r border-navy-900/15 pr-4 text-center">
                      <p className="font-mono text-[10px] uppercase tracking-widest text-navy-500">
                        {weekdayShort(r.event.start_at)}
                      </p>
                      <p className="font-display text-3xl font-extrabold leading-none text-navy-900">
                        {dayOfMonth(r.event.start_at)}
                      </p>
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-electric-700">
                        {monthShort(r.event.start_at)}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-navy-900">{r.event.title}</p>
                      <p className="mt-0.5 truncate font-mono text-xs text-slate-500">
                        {formatTime(r.event.start_at)} · {r.event.venue}
                      </p>
                    </div>
                    <div className="col-span-2 sm:col-span-1 sm:self-center">
                      <EventStatusBadge status={r.status} />
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="panel">
          <div className="panel-head">
            <h2 className="text-base font-semibold">Recently registered</h2>
          </div>
          {data.recent.length === 0 ? (
            <p className="px-5 py-8 text-center font-mono text-xs text-slate-500">NO REGISTRATIONS YET</p>
          ) : (
            <ul className="divide-y divide-navy-900/10">
              {data.recent.map((r) => (
                <li key={r.id} className="grid grid-cols-[52px_1fr] gap-3 px-5 py-2.5">
                  <span className="pt-0.5 font-mono text-[11px] text-slate-500">{formatDate(r.registered_at).split(',')[0]}</span>
                  <Link to={`/events/${r.event.id}`} className="min-w-0 truncate text-sm font-medium text-navy-900 hover:text-electric-700">
                    {r.event.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
