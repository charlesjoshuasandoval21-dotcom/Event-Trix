import { useMemo } from 'react';
import { UserX } from 'lucide-react';
import SearchBar from './SearchBar';
import Pagination from './Pagination';
import EmptyState, { ErrorState } from './EmptyState';
import EventStatusBadge from './EventStatusBadge';
import LoadingSpinner from './LoadingSpinner';
import { ClearFilters, SelectFilter } from './FilterControls';
import { useApi } from '../hooks/useApi';
import { useListParams } from '../hooks/useListParams';
import { organizerService } from '../services/eventService';
import { formatDate, formatDateTime } from '../utils/format';

export default function RegistrationsPanel({ eventId }) {
  const { values, set, clear, active } = useListParams({ search: '', status: 'all', event: '' });
  const activeEvent = eventId || values.event;

  const eventsList = useApi(
    () => (eventId ? Promise.resolve(null) : organizerService.events({ per_page: 50, sort: 'start_desc' })),
    [eventId]
  );

  const { data, loading, error, reload } = useApi(
    () =>
      organizerService.registrations({
        event_id: activeEvent,
        search: values.search,
        status: values.status,
        page: values.page,
        per_page: 10,
      }),
    [activeEvent, values.search, values.status, values.page]
  );

  const eventOptions = useMemo(
    () => [{ value: '', label: 'All events' }, ...(eventsList.data?.data ?? []).map((e) => ({ value: String(e.id), label: e.title }))],
    [eventsList.data]
  );

  const summary = data?.summary;
  const selected = summary?.event;
  const rows = data?.data ?? [];

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Registered" value={summary?.registered} />
        <Stat label="Cancelled" value={summary?.cancelled} />
        <Stat label="Capacity" value={selected ? (selected.capacity ?? 'No limit') : '—'} />
        <Stat label="Places left" value={selected ? (selected.remaining ?? '∞') : '—'} />
      </div>

      <div className="card mb-4 grid gap-3 p-4 md:grid-cols-[1fr_auto_auto_auto] md:items-center">
        <SearchBar value={values.search} onSearch={(v) => set({ search: v })} placeholder="Search by name, email or student number" />
        {!eventId && (
          <SelectFilter
            label="Event"
            value={values.event}
            onChange={(v) => set({ event: v })}
            options={eventOptions}
            className="md:w-60"
          />
        )}
        <SelectFilter
          label="Status"
          value={values.status}
          onChange={(v) => set({ status: v })}
          options={[
            { value: 'all', label: 'All statuses' },
            { value: 'registered', label: 'Registered' },
            { value: 'cancelled', label: 'Cancelled' },
          ]}
          className="md:w-40"
        />
        <ClearFilters visible={active} onClear={clear} />
      </div>

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading && !data ? (
        <LoadingSpinner label="Loading registrations…" />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={UserX}
          title="No registrations found"
          description={active ? 'Try changing or clearing the filters.' : 'Nobody has registered yet.'}
        />
      ) : (
        <>
          <div className={`card overflow-x-auto transition-opacity ${loading ? 'opacity-60' : ''}`}>
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Student</th>
                  <th className="px-4 py-3 font-semibold">Student no.</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  {!eventId && <th className="px-4 py-3 font-semibold">Event</th>}
                  <th className="px-4 py-3 font-semibold">Registered</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-navy-900">{r.user.name}</td>
                    <td className="px-4 py-3 text-slate-600">{r.user.student_number || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{r.user.email}</td>
                    {!eventId && <td className="max-w-[220px] truncate px-4 py-3 text-slate-600">{r.event.title}</td>}
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600" title={formatDateTime(r.registered_at)}>
                      {formatDate(r.registered_at)}
                    </td>
                    <td className="px-4 py-3">
                      <EventStatusBadge status={r.status} label={r.status === 'registered' ? 'Registered' : 'Cancelled'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination meta={data.meta} onChange={(page) => set({ page })} />
        </>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="card px-4 py-3">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-0.5 font-display text-xl font-bold text-navy-900">{value ?? '—'}</p>
    </div>
  );
}
