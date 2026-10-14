import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarClock, CheckCheck, Clock, ExternalLink, EyeOff, Globe, MapPin, Pencil, Trash2, Users, XCircle } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import EventBanner from '../../components/EventBanner';
import EventStatusBadge from '../../components/EventStatusBadge';
import RegistrationsPanel from '../../components/RegistrationsPanel';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState, { ErrorState } from '../../components/EmptyState';
import { useApi } from '../../hooks/useApi';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useEventActions } from '../../hooks/useEventActions';
import { organizerService } from '../../services/eventService';
import { formatDateTime, formatRange } from '../../utils/format';

export default function EventView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: event, loading, error, status, reload } = useApi(() => organizerService.event(id), [id]);
  useDocumentTitle(event?.title);

  const { ask, dialog } = useEventActions((p) => (p.type === 'delete' ? navigate('/organizer/events') : reload()));

  if (loading && !event) return <LoadingSpinner label="Loading event…" />;
  if (status === 404) {
    return (
      <EmptyState
        title="Event not found"
        action={
          <Link to="/organizer/events" className="btn-primary">
            Back to events
          </Link>
        }
      />
    );
  }
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const act = (st) => ask({ type: 'status', event, status: st });

  return (
    <>
      <Link to="/organizer/events" className="mb-3 inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-electric-700">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All events
      </Link>

      <PageHeader
        title={event.title}
        description={`${event.category.label} · ${event.venue}`}
        actions={
          <>
            <Link to={`/organizer/events/${event.id}/edit`} className="btn-secondary">
              <Pencil className="h-4 w-4" /> Edit
            </Link>
            {event.status !== 'draft' && (
              <Link to={`/events/${event.id}`} className="btn-secondary">
                <ExternalLink className="h-4 w-4" /> Public page
              </Link>
            )}
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-4">
          <div className="card overflow-hidden">
            <EventBanner src={event.banner_url} category={event.category.value} className="aspect-[16/9] w-full" />
            <div className="space-y-4 p-5">
              <EventStatusBadge status={event.status} />
              <dl className="space-y-3 text-sm">
                <Row icon={CalendarClock} label="When">
                  {formatRange(event.start_at, event.end_at)}
                </Row>
                <Row icon={MapPin} label="Venue">
                  {event.venue}
                </Row>
                <Row icon={Clock} label="Registration deadline">
                  {formatDateTime(event.registration_deadline)}
                </Row>
                <Row icon={Users} label="Registered">
                  {event.registered_count}
                  {event.capacity ? ` of ${event.capacity} (${event.remaining} left)` : ' (no limit)'}
                </Row>
              </dl>
            </div>
          </div>

          <div className="card space-y-2 p-5">
            <h2 className="text-sm font-semibold">Status actions</h2>
            {event.status === 'draft' && (
              <button className="btn-primary w-full" onClick={() => act('published')}>
                <Globe className="h-4 w-4" /> Publish
              </button>
            )}
            {event.status === 'published' && (
              <>
                <button className="btn-secondary w-full" onClick={() => act('draft')}>
                  <EyeOff className="h-4 w-4" /> Unpublish
                </button>
                <button className="btn-secondary w-full" onClick={() => act('completed')}>
                  <CheckCheck className="h-4 w-4" /> Mark as completed
                </button>
              </>
            )}
            {['draft', 'published'].includes(event.status) && (
              <button className="btn-secondary w-full text-red-700" onClick={() => act('cancelled')}>
                <XCircle className="h-4 w-4" /> Cancel event
              </button>
            )}
            {event.status === 'cancelled' && (
              <button className="btn-secondary w-full" onClick={() => act('draft')}>
                Move back to draft
              </button>
            )}
            {event.status === 'completed' && <p className="text-sm text-slate-500">This event is completed.</p>}
            <button className="btn-danger w-full" onClick={() => ask({ type: 'delete', event })}>
              <Trash2 className="h-4 w-4" /> Delete event
            </button>
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-lg font-semibold">Participants</h2>
          <RegistrationsPanel eventId={String(event.id)} />
        </div>
      </div>
      {dialog}
    </>
  );
}

function Row({ icon: Icon, label, children }) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-electric-600" aria-hidden="true" />
      <div>
        <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</dt>
        <dd className="mt-0.5 font-medium text-navy-900">{children}</dd>
      </div>
    </div>
  );
}
