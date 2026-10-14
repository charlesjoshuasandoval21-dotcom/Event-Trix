import { Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import StatStrip from '../../components/DashboardStatCard';
import EventStatusBadge from '../../components/EventStatusBadge';
import { ErrorState } from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useApi } from '../../hooks/useApi';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { organizerService } from '../../services/eventService';
import { useAuth } from '../../context/AuthContext';
import { dayOfMonth, formatDate, formatDateTime, monthShort, weekdayShort } from '../../utils/format';

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};

function Empty({ children }) {
  return <p className="px-5 py-8 text-center font-mono text-xs text-slate-500">{children}</p>;
}

function Gauge({ value, max }) {
  const ticks = 20;
  const filled = max ? Math.round((value / max) * ticks) : 0;
  return (
    <div className="flex gap-[3px]" aria-hidden="true">
      {Array.from({ length: ticks }).map((_, i) => (
        <span key={i} className={`h-2.5 flex-1 ${max && i < filled ? 'bg-electric-600' : 'bg-navy-900/10'}`} />
      ))}
    </div>
  );
}

export default function Overview() {
  useDocumentTitle('Organizer dashboard');
  const { user } = useAuth();
  const { data, loading, error, reload } = useApi(() => organizerService.dashboard(), []);

  if (loading && !data) return <LoadingSpinner label="Loading dashboard…" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const { stats } = data;
  const maxCat = Math.max(1, ...data.events_by_category.map((c) => c.total));
  const today = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());

  return (
    <>
      <PageHeader
        eyebrow={`Organizer / Overview · ${today}`}
        title={`${greeting()}, ${user.name.split(' ')[0]}.`}
        actions={
          <Link to="/organizer/events/new" className="btn-primary">
            + New event
          </Link>
        }
      />

      <nav aria-label="Quick actions" className="mb-6 grid grid-cols-2 gap-px border border-navy-900/20 bg-navy-900/20 lg:grid-cols-4">
        {[
          { to: "/organizer/events/new", t: "Create", d: "Add a new event" },
          { to: "/organizer/events", t: "Manage", d: "View, edit, publish, delete" },
          { to: "/organizer/registrations", t: "Registrations", d: "See who signed up" },
          { to: "/organizer/settings", t: "Settings", d: "Profile & password" },
        ].map((a) => (
          <Link key={a.to} to={a.to} className="group bg-white p-4 transition hover:bg-navy-900">
            <p className="font-display text-base font-bold text-navy-900 group-hover:text-white">{a.t} →</p>
            <p className="mt-0.5 font-mono text-[11px] text-slate-500 group-hover:text-navy-200">{a.d}</p>
          </Link>
        ))}
      </nav>

      <StatStrip
        cells={[
          { label: 'Total events', value: stats.total_events, hint: 'all statuses' },
          { label: 'Upcoming', value: stats.upcoming_events, hint: 'published, not yet ended' },
          { label: 'Registrations', value: stats.total_registrations, hint: 'active seats taken', accent: true },
          { label: 'Completed', value: stats.completed_events, hint: 'marked done' },
        ]}
      />

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        {}
        <section className="panel">
          <div className="panel-head">
            <h2 className="text-base font-semibold">Next up</h2>
            <Link to="/organizer/events" className="font-mono text-xs uppercase tracking-wider text-electric-700 hover:underline">
              All events →
            </Link>
          </div>
          {data.upcoming.length === 0 ? (
            <Empty>NOTHING SCHEDULED — publish an event to see it here.</Empty>
          ) : (
            <ol className="divide-y divide-navy-900/10">
              {data.upcoming.map((e) => (
                <li key={e.id}>
                  <Link
                    to={`/organizer/events/${e.id}`}
                    className="grid grid-cols-[64px_1fr] gap-4 px-5 py-4 transition hover:bg-electric-50/60 sm:grid-cols-[72px_1fr_180px]"
                  >
                    <div className="border-r border-navy-900/15 pr-4 text-center">
                      <p className="font-mono text-[10px] uppercase tracking-widest text-navy-500">
                        {weekdayShort(e.start_at)}
                      </p>
                      <p className="font-display text-3xl font-extrabold leading-none text-navy-900">
                        {dayOfMonth(e.start_at)}
                      </p>
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-electric-700">
                        {monthShort(e.start_at)}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-navy-900">{e.title}</p>
                      <p className="mt-0.5 truncate font-mono text-xs text-slate-500">
                        {formatDateTime(e.start_at).split(', ').pop()} · {e.venue}
                      </p>
                      <p className="mt-2 sm:hidden font-mono text-[11px] text-navy-700">
                        {e.registered_count}
                        {e.capacity ? ` / ${e.capacity}` : ''} registered
                      </p>
                    </div>
                    <div className="hidden self-center sm:block">
                      <div className="mb-1.5 flex justify-between font-mono text-[11px] text-navy-700">
                        <span>
                          {e.registered_count}
                          {e.capacity ? ` / ${e.capacity}` : ' seats'}
                        </span>
                        <span>{e.capacity ? `${Math.round((e.registered_count / e.capacity) * 100)}%` : 'open'}</span>
                      </div>
                      <Gauge value={e.registered_count} max={e.capacity} />
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </section>

        <div className="space-y-6">
          {}
          <section className="panel">
            <div className="panel-head">
              <h2 className="text-base font-semibold">Event mix</h2>
              <span className="tag">{stats.total_events} total</span>
            </div>
            <ul className="space-y-3 p-5">
              {data.events_by_category.map((c) => (
                <li key={c.value} className="grid grid-cols-[96px_1fr_24px] items-center gap-3">
                  <span className="truncate text-sm text-navy-800">{c.label}</span>
                  <span className="h-2 bg-navy-900/10">
                    <span className="block h-full bg-navy-900" style={{ width: `${(c.total / maxCat) * 100}%` }} />
                  </span>
                  <span className="text-right font-mono text-xs font-semibold text-navy-900">{c.total}</span>
                </li>
              ))}
            </ul>
          </section>

          {}
          <section className="panel">
            <div className="panel-head">
              <h2 className="text-base font-semibold">Latest sign-ups</h2>
              <Link to="/organizer/registrations" className="font-mono text-xs uppercase tracking-wider text-electric-700 hover:underline">
                Ledger →
              </Link>
            </div>
            {data.recent_registrations.length === 0 ? (
              <Empty>NO REGISTRATIONS YET</Empty>
            ) : (
              <ul className="divide-y divide-navy-900/10">
                {data.recent_registrations.map((r) => (
                  <li key={r.id} className="grid grid-cols-[52px_1fr] gap-3 px-5 py-2.5">
                    <span className="pt-0.5 font-mono text-[11px] text-slate-500">{formatDate(r.registered_at).split(',')[0]}</span>
                    <p className="min-w-0 truncate text-sm">
                      <span className="font-semibold text-navy-900">{r.user.name}</span>
                      <span className="text-slate-500">
                        {r.status === 'cancelled' ? ' cancelled ' : ' → '}
                      </span>
                      <span className="text-navy-700">{r.event.title}</span>
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      {}
      <section className="panel mt-6">
        <div className="panel-head">
          <h2 className="text-base font-semibold">Recently created</h2>
        </div>
        {data.recent_events.length === 0 ? (
          <Empty>NO EVENTS CREATED YET</Empty>
        ) : (
          <ul className="divide-y divide-navy-900/10">
            {data.recent_events.map((e) => (
              <li key={e.id}>
                <Link
                  to={`/organizer/events/${e.id}`}
                  className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 px-5 py-3 transition hover:bg-electric-50/60"
                >
                  <span className="min-w-0 flex-1 truncate font-medium text-navy-900">{e.title}</span>
                  <span className="font-mono text-xs text-slate-500">{e.category.label}</span>
                  <span className="font-mono text-xs text-slate-500">{formatDate(e.start_at)}</span>
                  <EventStatusBadge status={e.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
