import { Link } from 'react-router-dom';
import { ArrowUpRight, Calendar, MapPin, Users } from 'lucide-react';
import EventBanner from './EventBanner';
import CategoryIcon from './CategoryIcon';
import { AvailabilityBadge } from './EventStatusBadge';
import { dayOfMonth, formatTime, monthShort } from '../utils/format';

export default function EventCard({ event }) {
  const { registration, capacity, remaining } = event;

  return (
    <article className="group card flex flex-col overflow-hidden transition duration-200 hover:-translate-y-1 hover:shadow-lift">
      <Link to={`/events/${event.id}`} className="relative block" aria-label={`View ${event.title}`}>
        <EventBanner
          src={event.banner_url}
          category={event.category.value}
          alt=""
          className="aspect-[16/9] w-full transition duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-navy-950/80 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
          <CategoryIcon category={event.category.value} className="h-3.5 w-3.5" />
          {event.category.label}
        </div>
        <div className="absolute bottom-0 right-3 translate-y-1/2 rounded-lg bg-white px-2.5 py-1.5 text-center shadow-card ring-1 ring-slate-200">
          <div className="text-[10px] font-bold uppercase leading-none tracking-wider text-electric-600">
            {monthShort(event.start_at)}
          </div>
          <div className="font-display text-lg font-bold leading-tight text-navy-900">{dayOfMonth(event.start_at)}</div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5 pt-6">
        <div className="mb-3">
          <AvailabilityBadge registration={registration} />
        </div>
        <h3 className="line-clamp-2 text-lg font-semibold leading-snug">
          <Link to={`/events/${event.id}`} className="hover:text-electric-700">
            {event.title}
          </Link>
        </h3>
        {event.summary && <p className="mt-1.5 line-clamp-2 text-sm text-slate-600">{event.summary}</p>}

        <ul className="mt-4 space-y-1.5 text-sm text-slate-600">
          <li className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0 text-electric-600" aria-hidden="true" />
            {monthShort(event.start_at)} {dayOfMonth(event.start_at)} · {formatTime(event.start_at)}
          </li>
          <li className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-electric-600" aria-hidden="true" />
            <span className="truncate">{event.venue}</span>
          </li>
          <li className="flex items-center gap-2">
            <Users className="h-4 w-4 shrink-0 text-electric-600" aria-hidden="true" />
            {capacity ? `${remaining} of ${capacity} spots left` : `${event.registered_count} registered`}
          </li>
        </ul>

        <Link to={`/events/${event.id}`} className="btn-secondary mt-5 w-full justify-between group-hover:border-electric-500">
          View details
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

export function EventCardSkeleton() {
  return (
    <div className="card animate-pulse overflow-hidden" aria-hidden="true">
      <div className="aspect-[16/9] bg-slate-200" />
      <div className="space-y-3 p-5">
        <div className="h-4 w-24 rounded bg-slate-200" />
        <div className="h-5 w-4/5 rounded bg-slate-200" />
        <div className="h-4 w-full rounded bg-slate-100" />
        <div className="h-4 w-2/3 rounded bg-slate-100" />
        <div className="h-10 w-full rounded-lg bg-slate-100" />
      </div>
    </div>
  );
}
