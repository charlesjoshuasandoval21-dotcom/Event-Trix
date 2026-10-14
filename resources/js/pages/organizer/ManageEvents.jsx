import { Link } from 'react-router-dom';
import { CalendarX, Eye, EyeOff, Globe, Pencil, Plus, Trash2 } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import SearchBar from '../../components/SearchBar';
import Pagination from '../../components/Pagination';
import EventBanner from '../../components/EventBanner';
import EventStatusBadge from '../../components/EventStatusBadge';
import EmptyState, { ErrorState } from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ClearFilters, SelectFilter } from '../../components/FilterControls';
import { useApi } from '../../hooks/useApi';
import { useCategories } from '../../hooks/useCategories';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useEventActions } from '../../hooks/useEventActions';
import { useListParams } from '../../hooks/useListParams';
import { organizerService } from '../../services/eventService';
import { EVENT_STATUSES } from '../../utils/constants';
import { formatDateTime } from '../../utils/format';

const DEFAULTS = { search: '', category: '', status: '', sort: 'start_desc' };

export default function ManageEvents() {
  useDocumentTitle('Manage events');
  const categories = useCategories();
  const { values, set, clear, active } = useListParams(DEFAULTS);

  const { data, loading, error, reload } = useApi(
    () =>
      organizerService.events({
        search: values.search,
        category: values.category,
        status: values.status,
        sort: values.sort,
        page: values.page,
        per_page: 10,
      }),
    [values.search, values.category, values.status, values.sort, values.page]
  );

  const { ask, dialog } = useEventActions(reload);
  const events = data?.data ?? [];

  return (
    <>
      <PageHeader
        title="Manage events"
        eyebrow="Create · Read · Update · Delete"
        description="Create new events, open one to read its details, edit it, publish it, or delete it."
        actions={
          <Link to="/organizer/events/new" className="btn-primary">
            <Plus className="h-4 w-4" aria-hidden="true" /> Create new event
          </Link>
        }
      />

      <div className="card mb-4 grid gap-3 p-4 md:grid-cols-[1fr_auto_auto_auto_auto] md:items-center">
        <SearchBar value={values.search} onSearch={(v) => set({ search: v })} placeholder="Search by title or venue" />
        <SelectFilter
          label="Category"
          value={values.category}
          onChange={(v) => set({ category: v })}
          options={[{ value: '', label: 'All categories' }, ...categories]}
          className="md:w-44"
        />
        <SelectFilter
          label="Status"
          value={values.status}
          onChange={(v) => set({ status: v })}
          options={[{ value: '', label: 'All statuses' }, ...EVENT_STATUSES]}
          className="md:w-40"
        />
        <SelectFilter
          label="Sort"
          value={values.sort}
          onChange={(v) => set({ sort: v })}
          options={[
            { value: 'start_desc', label: 'Date: newest first' },
            { value: 'start_asc', label: 'Date: oldest first' },
            { value: 'created_desc', label: 'Recently created' },
          ]}
          className="md:w-48"
        />
        <ClearFilters visible={active} onClear={clear} />
      </div>

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading && !data ? (
        <LoadingSpinner label="Loading events…" />
      ) : events.length === 0 ? (
        <EmptyState
          icon={CalendarX}
          title={active ? 'No events match your filters' : 'No events yet'}
          description={active ? 'Try different filters.' : 'Create your first event to get started.'}
          action={
            active ? (
              <button className="btn-primary" onClick={clear}>
                Clear filters
              </button>
            ) : (
              <Link to="/organizer/events/new" className="btn-primary">
                Create event
              </Link>
            )
          }
        />
      ) : (
        <>
          <div className={`card overflow-x-auto transition-opacity ${loading ? 'opacity-60' : ''}`}>
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Event</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Start</th>
                  <th className="px-4 py-3 font-semibold">Venue</th>
                  <th className="px-4 py-3 font-semibold">Registered</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {events.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <EventBanner
                          src={e.banner_url}
                          category={e.category.value}
                          className="h-11 w-16 shrink-0 rounded-md"
                          iconClass="h-5 w-5"
                        />
                        <Link to={`/organizer/events/${e.id}`} className="line-clamp-2 max-w-[260px] font-semibold text-navy-900 hover:text-electric-700">
                          {e.title}
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{e.category.label}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDateTime(e.start_at)}</td>
                    <td className="max-w-[160px] truncate px-4 py-3 text-slate-600">{e.venue}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {e.registered_count}
                      {e.capacity ? ` / ${e.capacity}` : ''}
                    </td>
                    <td className="px-4 py-3">
                      <EventStatusBadge status={e.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap justify-end gap-1.5">
                        <Link to={`/organizer/events/${e.id}`} className="btn-secondary btn-sm">View</Link>
                        <Link to={`/organizer/events/${e.id}/edit`} className="btn-secondary btn-sm">Edit</Link>
                        {e.status === "draft" && (
                          <button className="btn-primary btn-sm" onClick={() => ask({ type: "status", event: e, status: "published" })}>Publish</button>
                        )}
                        {e.status === "published" && (
                          <button className="btn-secondary btn-sm" onClick={() => ask({ type: "status", event: e, status: "draft" })}>Unpublish</button>
                        )}
                        <button className="btn-sm btn border border-red-300 bg-white text-red-700 hover:bg-red-50" onClick={() => ask({ type: "delete", event: e })}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination meta={data.meta} onChange={(page) => set({ page })} />
        </>
      )}
      {dialog}
    </>
  );
}

const iconBtn = 'rounded-md p-2 text-slate-500 transition hover:bg-slate-100 hover:text-navy-900';

function IconLink({ to, label, icon: Icon }) {
  return (
    <Link to={to} className={iconBtn} title={label} aria-label={label}>
      <Icon className="h-4 w-4" />
    </Link>
  );
}

function IconButton({ label, icon: Icon, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`${iconBtn} ${danger ? 'hover:!bg-red-50 hover:!text-red-600' : ''}`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
