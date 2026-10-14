import { SearchX } from 'lucide-react';
import EventCard, { EventCardSkeleton } from '../../components/EventCard';
import EmptyState, { ErrorState } from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import SearchBar from '../../components/SearchBar';
import { ClearFilters, SelectFilter } from '../../components/FilterControls';
import { useApi } from '../../hooks/useApi';
import { useCategories } from '../../hooks/useCategories';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useListParams } from '../../hooks/useListParams';
import { eventService } from '../../services/eventService';

const DEFAULTS = { search: '', category: '', time: 'upcoming', sort: 'soonest' };

export default function Explore() {
  useDocumentTitle('Explore Events');
  const categories = useCategories();
  const { values, set, clear, active } = useListParams(DEFAULTS);

  const { data, loading, error, reload } = useApi(
    () =>
      eventService.list({
        search: values.search,
        category: values.category,
        time: values.time,
        sort: values.sort,
        page: values.page,
        per_page: 9,
      }),
    [values.search, values.category, values.time, values.sort, values.page]
  );

  const events = data?.data ?? [];

  return (
    <div>
      <section className="bg-navy-950 py-12 text-white">
        <div className="container-page">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">Explore events</h1>
          <p className="mt-2 max-w-2xl text-navy-200">
            Browse hackathons, seminars, workshops and tournaments from the IT department.
          </p>
        </div>
      </section>

      <div className="container-page py-8">
        <div className="card mb-8 grid gap-3 p-4 md:grid-cols-[1fr_auto_auto_auto_auto] md:items-center">
          <SearchBar
            value={values.search}
            onSearch={(v) => set({ search: v })}
            placeholder="Search events by title or description"
          />
          <SelectFilter
            label="Category"
            value={values.category}
            onChange={(v) => set({ category: v })}
            options={[{ value: '', label: 'All categories' }, ...categories]}
            className="md:w-44"
          />
          <SelectFilter
            label="When"
            value={values.time}
            onChange={(v) => set({ time: v })}
            options={[
              { value: 'upcoming', label: 'Upcoming' },
              { value: 'past', label: 'Past events' },
              { value: 'all', label: 'All dates' },
            ]}
            className="md:w-40"
          />
          <SelectFilter
            label="Sort"
            value={values.sort}
            onChange={(v) => set({ sort: v })}
            options={[
              { value: 'soonest', label: 'Soonest first' },
              { value: 'latest', label: 'Latest first' },
            ]}
            className="md:w-40"
          />
          <ClearFilters visible={active} onClear={clear} />
        </div>

        {error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : loading && !data ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        ) : events.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="No events match your search"
            description={active ? 'Try different keywords or clear the filters.' : 'There are no events here yet.'}
            action={
              active && (
                <button className="btn-primary" onClick={clear}>
                  Clear filters
                </button>
              )
            }
          />
        ) : (
          <>
            <p className="mb-4 text-sm text-slate-500" aria-live="polite">
              {data.meta.total} event{data.meta.total === 1 ? '' : 's'} found
            </p>
            <div className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-3 transition-opacity ${loading ? 'opacity-60' : ''}`}>
              {events.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
            <Pagination meta={data.meta} onChange={(page) => set({ page })} />
          </>
        )}
      </div>
    </div>
  );
}
