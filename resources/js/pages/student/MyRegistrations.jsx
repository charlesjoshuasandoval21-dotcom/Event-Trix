import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Ticket } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import SearchBar from '../../components/SearchBar';
import Pagination from '../../components/Pagination';
import EventStatusBadge from '../../components/EventStatusBadge';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import EmptyState, { ErrorState } from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ClearFilters, SegmentedControl } from '../../components/FilterControls';
import { useApi } from '../../hooks/useApi';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useListParams } from '../../hooks/useListParams';
import { useToast } from '../../context/ToastContext';
import { registrationService } from '../../services/eventService';
import { getErrorMessage } from '../../utils/errors';
import { formatDate, formatDateTime } from '../../utils/format';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'past', label: 'Past' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function MyRegistrations() {
  useDocumentTitle('My registrations');
  const toast = useToast();
  const { values, set, clear, active } = useListParams({ filter: 'all', search: '' });
  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const { data, loading, error, reload } = useApi(
    () => registrationService.mine({ filter: values.filter, search: values.search, page: values.page, per_page: 10 }),
    [values.filter, values.search, values.page]
  );

  const rows = data?.data ?? [];

  const cancel = async () => {
    setBusy(true);
    try {
      await registrationService.cancel(target.id);
      toast.success('Registration cancelled.');
      setTarget(null);
      await reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
      setTarget(null);
      await reload();
    } finally {
      setBusy(false);
    }
  };

  const statusFor = (r) => {
    if (r.status === 'cancelled') return <EventStatusBadge status="cancelled" label="Cancelled" />;
    if (r.event.status === 'cancelled') return <EventStatusBadge status="cancelled" label="Event cancelled" />;
    if (r.event.status === 'completed') return <EventStatusBadge status="completed" />;
    return <EventStatusBadge status="registered" />;
  };

  return (
    <>
      <PageHeader title="My registrations" description="Events you've registered for." />

      <div className="card mb-4 flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
        <SegmentedControl label="Filter registrations" value={values.filter} onChange={(v) => set({ filter: v })} options={FILTERS} />
        <SearchBar
          className="lg:ml-auto lg:w-72"
          value={values.search}
          onSearch={(v) => set({ search: v })}
          placeholder="Search by event title"
        />
        <ClearFilters visible={active} onClear={clear} />
      </div>

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading && !data ? (
        <LoadingSpinner label="Loading your registrations…" />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title={active ? 'No registrations match' : "You haven't registered for any events"}
          description={active ? 'Try another filter.' : 'Find an event you like and register in one click.'}
          action={
            active ? (
              <button className="btn-primary" onClick={clear}>
                Clear filters
              </button>
            ) : (
              <Link to="/events" className="btn-primary">
                Explore events
              </Link>
            )
          }
        />
      ) : (
        <>
          <div className={`grid gap-3 transition-opacity ${loading ? 'opacity-60' : ''}`}>
            {rows.map((r) => (
              <article key={r.id} className="card flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    {statusFor(r)}
                    <span className="text-xs text-slate-500">{r.event.category.label}</span>
                  </div>
                  <Link to={`/events/${r.event.id}`} className="block truncate text-lg font-semibold text-navy-900 hover:text-electric-700">
                    {r.event.title}
                  </Link>
                  <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
                    <span>{formatDateTime(r.event.start_at)}</span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                      {r.event.venue}
                    </span>
                    <span className="text-slate-500">Registered {formatDate(r.registered_at)}</span>
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Link to={`/events/${r.event.id}`} className="btn-secondary btn-sm">
                    View event
                  </Link>
                  {r.can_cancel && (
                    <button className="btn-secondary btn-sm text-red-700" onClick={() => setTarget(r)}>
                      Cancel registration
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
          <Pagination meta={data.meta} onChange={(page) => set({ page })} />
        </>
      )}

      <ConfirmationDialog
        open={!!target}
        title="Cancel this registration?"
        description={target ? `You will give up your spot for "${target.event.title}".` : ''}
        confirmLabel="Yes, cancel"
        cancelLabel="Keep registration"
        danger
        loading={busy}
        onConfirm={cancel}
        onCancel={() => setTarget(null)}
      />
    </>
  );
}
