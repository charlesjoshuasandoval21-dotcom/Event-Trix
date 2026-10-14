import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Clock,
  Loader2,
  Lock,
  MapPin,
  Settings2,
  User,
  Users,
} from 'lucide-react';
import EventBanner from '../../components/EventBanner';
import CategoryIcon from '../../components/CategoryIcon';
import EventStatusBadge, { AvailabilityBadge } from '../../components/EventStatusBadge';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState, { ErrorState } from '../../components/EmptyState';
import { useApi } from '../../hooks/useApi';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { registrationService, eventService } from '../../services/eventService';
import { getErrorMessage } from '../../utils/errors';
import { formatDateTime, formatLongDate, formatRange } from '../../utils/format';

function DetailRow({ icon: Icon, label, children }) {
  return (
    <li className="flex gap-3">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-electric-600" aria-hidden="true" />
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
        <div className="mt-0.5 text-sm font-medium text-navy-900">{children}</div>
      </div>
    </li>
  );
}

export default function EventDetails() {
  const { id } = useParams();
  const location = useLocation();
  const { user, isAuthenticated, isStudent, isOrganizer } = useAuth();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const { data: event, loading, error, status, reload } = useApi(() => eventService.get(id), [id, user?.id]);
  useDocumentTitle(event?.title);

  if (loading && !event) return <LoadingSpinner label="Loading event…" className="py-32" />;

  if (status === 404) {
    return (
      <div className="container-page py-16">
        <EmptyState
          title="Event not found"
          description="This event doesn't exist or is not available to the public."
          action={
            <Link to="/events" className="btn-primary">
              Browse events
            </Link>
          }
        />
      </div>
    );
  }
  if (error) {
    return (
      <div className="container-page py-16">
        <ErrorState message={error} onRetry={reload} />
      </div>
    );
  }

  const mine = event.my_registration;
  const isRegistered = mine?.status === 'registered';
  const { registration } = event;

  const handleRegister = async () => {
    setBusy(true);
    try {
      await registrationService.register(event.id);
      toast.success('You are registered! See you there.');
      await reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
      await reload();
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = async () => {
    setBusy(true);
    try {
      await registrationService.cancel(mine.id);
      toast.success('Your registration has been cancelled.');
      setConfirmCancel(false);
      await reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
      setConfirmCancel(false);
      await reload();
    } finally {
      setBusy(false);
    }
  };

  let action;
  if (!isAuthenticated) {
    action = (
      <div className="space-y-3">
        <div className="flex items-start gap-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
          Log in or create a student account to register for this event.
        </div>
        <Link to="/login" state={{ from: location }} className="btn-primary w-full">
          Log in to register
        </Link>
        <Link to="/register" state={{ from: location }} className="btn-secondary w-full">
          Create an account
        </Link>
      </div>
    );
  } else if (isOrganizer) {
    action = (
      <Link to={`/organizer/events/${event.id}/edit`} className="btn-dark w-full">
        <Settings2 className="h-4 w-4" aria-hidden="true" /> Manage this event
      </Link>
    );
  } else if (isStudent && isRegistered) {
    action = (
      <div className="space-y-3">
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
          <CheckCircle2 className="h-5 w-5" aria-hidden="true" /> Already Registered
        </div>
        {event.can_cancel_registration ? (
          <button className="btn-secondary w-full" onClick={() => setConfirmCancel(true)} disabled={busy}>
            Cancel registration
          </button>
        ) : (
          <p className="text-xs text-slate-500">Registrations can no longer be cancelled for this event.</p>
        )}
        <Link to="/student/registrations" className="btn-ghost w-full">
          View my registrations
        </Link>
      </div>
    );
  } else if (registration.open) {
    action = (
      <button className="btn-primary btn-lg w-full" onClick={handleRegister} disabled={busy}>
        {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        Register Now
      </button>
    );
  } else {
    const label = { full: 'Event Full', cancelled: 'Event Cancelled', completed: 'Event Completed' }[registration.reason] || 'Registration Closed';
    action = (
      <div>
        <button className="btn-secondary btn-lg w-full" disabled>
          {label}
        </button>
        <p className="mt-2 text-center text-xs text-slate-500">{registration.message}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="relative bg-navy-950">
        <EventBanner
          src={event.banner_url}
          category={event.category.value}
          alt={`Banner for ${event.title}`}
          className="h-56 w-full opacity-60 sm:h-72 lg:h-80"
          iconClass="h-16 w-16"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-transparent" />
        <div className="container-page absolute inset-x-0 bottom-0 pb-6">
          <Link to="/events" className="mb-3 inline-flex items-center gap-1.5 text-sm text-navy-200 hover:text-white">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All events
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-electric-600 px-3 py-1 text-xs font-semibold text-white">
              <CategoryIcon category={event.category.value} className="h-3.5 w-3.5" />
              {event.category.label}
            </span>
            {['completed', 'cancelled', 'draft'].includes(event.status) && <EventStatusBadge status={event.status} />}
          </div>
          <h1 className="mt-3 max-w-4xl text-3xl font-extrabold text-white sm:text-4xl">{event.title}</h1>
        </div>
      </div>

      <div className="container-page grid gap-8 py-10 lg:grid-cols-[1fr_380px]">
        <div>
          {event.status === 'cancelled' && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
              This event has been cancelled.
            </div>
          )}
          {event.status === 'completed' && (
            <div className="mb-6 rounded-lg border border-slate-200 bg-slate-100 p-4 text-sm font-medium text-slate-700">
              This event has been completed.
            </div>
          )}
          {event.summary && <p className="mb-6 text-lg font-medium leading-relaxed text-navy-800">{event.summary}</p>}
          <h2 className="text-xl font-bold">About this event</h2>
          <div className="mt-3 space-y-4 whitespace-pre-line leading-relaxed text-slate-700">{event.description}</div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-6">
            <div className="mb-5 flex items-center justify-between gap-2">
              <h2 className="text-lg font-bold">Event details</h2>
              <AvailabilityBadge registration={registration} />
            </div>

            <ul className="space-y-4">
              <DetailRow icon={CalendarClock} label="Date & time">
                <p>{formatLongDate(event.start_at)}</p>
                <p className="font-normal text-slate-600">{formatRange(event.start_at, event.end_at)}</p>
              </DetailRow>
              <DetailRow icon={MapPin} label="Venue">
                {event.venue}
              </DetailRow>
              <DetailRow icon={Clock} label="Registration deadline">
                {formatDateTime(event.registration_deadline)}
              </DetailRow>
              <DetailRow icon={Users} label="Participants">
                {event.capacity
                  ? `${event.registered_count} / ${event.capacity} registered · ${event.remaining} left`
                  : `${event.registered_count} registered · no limit`}
              </DetailRow>
              {event.organizer && (
                <DetailRow icon={User} label="Organizer">
                  {event.organizer.name} · IT Department
                </DetailRow>
              )}
            </ul>

            {event.capacity && (
              <div className="mt-5" aria-hidden="true">
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-electric-500 transition-all"
                    style={{ width: `${Math.min(100, (event.registered_count / event.capacity) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            <div className="mt-6 border-t border-slate-100 pt-6">{action}</div>
          </div>
        </aside>
      </div>

      <ConfirmationDialog
        open={confirmCancel}
        title="Cancel your registration?"
        description={`You will give up your spot for "${event.title}". You can register again later if seats are still available.`}
        confirmLabel="Yes, cancel registration"
        cancelLabel="Keep my spot"
        danger
        loading={busy}
        onConfirm={handleCancel}
        onCancel={() => setConfirmCancel(false)}
      />
    </div>
  );
}
