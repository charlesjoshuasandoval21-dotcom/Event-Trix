import { Link } from 'react-router-dom';
import { ArrowRight, CalendarSearch, ClipboardCheck, Users } from 'lucide-react';
import EventCard, { EventCardSkeleton } from '../../components/EventCard';
import EmptyState, { ErrorState } from '../../components/EmptyState';
import CategoryIcon from '../../components/CategoryIcon';
import EventBanner from '../../components/EventBanner';
import { useApi } from '../../hooks/useApi';
import { useCategories } from '../../hooks/useCategories';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { eventService } from '../../services/eventService';
import { useAuth } from '../../context/AuthContext';

export default function Home() {
  useDocumentTitle();
  const { isAuthenticated, homePath } = useAuth();
  const categories = useCategories();
  const featured = useApi(() => eventService.list({ status: 'published', time: 'upcoming', per_page: 6 }), []);
  const events = featured.data?.data ?? [];

  return (
    <>
      {}
      <section className="relative overflow-hidden bg-navy-950 text-white">
        <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:44px_44px]" />
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-electric-600/30 blur-[120px]" />
        <div className="container-page relative grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-electric-300">
              <span className="h-1.5 w-1.5 rounded-full bg-electric-400" />
              IT Department Events Platform
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.08] text-white sm:text-5xl lg:text-6xl">
              Discover What&apos;s Next in <span className="text-electric-400">Tech.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-navy-200">
              Hackathons, seminars, workshops and tournaments from your IT department — all in one place. Find an event,
              claim your seat, and show up ready to build.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/events" className="btn-primary btn-lg">
                Explore Events <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                to={isAuthenticated ? homePath : '/register'}
                className="btn btn-lg border border-white/25 text-white hover:bg-white/10"
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Join the Community'}
              </Link>
            </div>
          </div>

          <div className="relative animate-fade-up [animation-delay:120ms]">
            <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-electric-500/40 to-transparent blur-xl" />
            <div className="relative overflow-hidden rounded-2xl border border-white/15 shadow-lift">
              <EventBanner
                src={null}
                category="seminar"
                alt=""
                className="aspect-[4/3] w-full"
                iconClass="h-16 w-16"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950 via-navy-950/70 to-transparent p-5 pt-16">
                <p className="text-xs font-semibold uppercase tracking-widest text-electric-300">Built for students</p>
                <p className="mt-1 font-display text-lg font-semibold">Register in seconds. Show up ready.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {}
      <section className="container-page py-16">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-electric-600">Coming up</p>
            <h2 className="mt-1 text-3xl font-bold">Featured events</h2>
          </div>
          <Link to="/events" className="btn-ghost self-start">
            View all events <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {featured.loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        ) : featured.error ? (
          <ErrorState message={featured.error} onRetry={featured.reload} />
        ) : events.length === 0 ? (
          <EmptyState
            icon={CalendarSearch}
            title="No upcoming events yet"
            description="Organizers haven't published any upcoming events. Check back soon!"
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        )}
      </section>

      {}
      <section className="border-y border-slate-200 bg-white py-16">
        <div className="container-page">
          <div className="mb-8 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-electric-600">Browse by interest</p>
            <h2 className="mt-1 text-3xl font-bold">Find your kind of event</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {categories.map((c) => (
              <Link
                key={c.value}
                to={`/events?category=${c.value}`}
                className="group flex flex-col items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:border-electric-300 hover:bg-electric-50 hover:shadow-card"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-navy-900 text-white transition group-hover:bg-electric-600">
                  <CategoryIcon category={c.value} className="h-5 w-5" />
                </span>
                <span className="font-display text-sm font-semibold text-navy-900">{c.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {}
      <section className="container-page py-16">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-electric-600">About Eventrix</p>
            <h2 className="mt-1 text-3xl font-bold">One home for every IT department activity</h2>
            <p className="mt-4 leading-relaxed text-slate-600">
              Eventrix helps the IT department publish its events and helps students actually find them. Instead of
              scattered posts and paper sign-up sheets, organizers manage events and registrations in one dashboard while
              students browse, register, and keep track of what they&apos;ve joined.
            </p>
            <Link to="/about" className="btn-secondary mt-6">
              Learn more
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {[
              { icon: CalendarSearch, title: 'Discover', text: 'Search and filter every upcoming IT event.' },
              { icon: ClipboardCheck, title: 'Register', text: 'Reserve a seat online before the deadline.' },
              { icon: Users, title: 'Participate', text: 'Track your registrations from one dashboard.' },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="card p-5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-electric-50 text-electric-600">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
