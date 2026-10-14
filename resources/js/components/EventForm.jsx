import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import FormField from './FormField';
import EventBanner from './EventBanner';
import { useCategories } from '../hooks/useCategories';
import { toDateTimeLocal } from '../utils/format';

const EMPTY = {
  title: '',
  summary: '',
  description: '',
  category: 'workshop',
  banner_url: '',
  venue: '',
  start_at: '',
  end_at: '',
  registration_deadline: '',
  capacity: '',
  status: 'draft',
};

export function eventToForm(event) {
  if (!event) return EMPTY;
  return {
    title: event.title,
    summary: event.summary || '',
    description: event.description,
    category: event.category.value,
    banner_url: event.banner_url || '',
    venue: event.venue,
    start_at: toDateTimeLocal(event.start_at),
    end_at: toDateTimeLocal(event.end_at),
    registration_deadline: toDateTimeLocal(event.registration_deadline),
    capacity: event.capacity ?? '',
    status: event.status,
  };
}

function Section({ title, description, children }) {
  return (
    <section className="card p-5 sm:p-6">
      <div className="mb-5 border-b border-slate-100 pb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
      </div>
      <div className="grid gap-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export default function EventForm({ initial, errors = {}, submitting, onSubmit, submitLabel = 'Save event' }) {
  const categories = useCategories();
  const [form, setForm] = useState(() => eventToForm(initial));
  const [clientErrors, setClientErrors] = useState({});

  const locked = initial && ['completed', 'cancelled'].includes(initial.status);
  const fieldError = (k) => clientErrors[k] || errors[k];
  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const problems = {};
    if (form.start_at && form.end_at && form.end_at <= form.start_at) {
      problems.end_at = 'The end time must be later than the start time.';
    }
    if (form.start_at && form.registration_deadline && form.registration_deadline > form.start_at) {
      problems.registration_deadline = 'The registration deadline cannot be after the event starts.';
    }
    setClientErrors(problems);
    if (Object.keys(problems).length) return;

    const payload = {
      ...form,
      summary: form.summary || null,
      banner_url: form.banner_url || null,
      capacity: form.capacity === '' ? null : Number(form.capacity),
    };
    if (locked) delete payload.status;
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <Section title="Basics" description="What is the event and how should it look?">
        <FormField label="Event title" error={fieldError('title')} required className="sm:col-span-2">
          {(p) => <input {...p} type="text" maxLength={150} value={form.title} onChange={update('title')} />}
        </FormField>
        <FormField label="Short summary" error={fieldError('summary')} hint="Shown on event cards (max 300 characters)." className="sm:col-span-2">
          {(p) => <input {...p} type="text" maxLength={300} value={form.summary} onChange={update('summary')} />}
        </FormField>
        <FormField label="Category" error={fieldError('category')} required>
          {(p) => (
            <select {...p} value={form.category} onChange={update('category')}>
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          )}
        </FormField>
        <FormField label="Banner image URL" error={fieldError('banner_url')} hint="Optional. Must start with http:// or https://">
          {(p) => (
            <input {...p} type="url" placeholder="https://…" value={form.banner_url} onChange={update('banner_url')} />
          )}
        </FormField>
        {form.banner_url && !fieldError('banner_url') && (
          <div className="sm:col-span-2">
            <p className="label">Banner preview</p>
            <EventBanner
              key={form.banner_url}
              src={form.banner_url}
              category={form.category}
              alt="Banner preview"
              className="h-40 w-full max-w-md rounded-lg border border-slate-200"
            />
          </div>
        )}
        <FormField label="Full description" error={fieldError('description')} required className="sm:col-span-2">
          {(p) => <textarea {...p} rows={7} value={form.description} onChange={update('description')} />}
        </FormField>
      </Section>

      <Section title="Schedule & venue" description="Times are shown in the department's local timezone.">
        <FormField label="Venue" error={fieldError('venue')} required className="sm:col-span-2">
          {(p) => <input {...p} type="text" maxLength={200} value={form.venue} onChange={update('venue')} />}
        </FormField>
        <FormField label="Starts" error={fieldError('start_at')} required>
          {(p) => <input {...p} type="datetime-local" value={form.start_at} onChange={update('start_at')} />}
        </FormField>
        <FormField label="Ends" error={fieldError('end_at')} required>
          {(p) => <input {...p} type="datetime-local" value={form.end_at} onChange={update('end_at')} />}
        </FormField>
        <FormField label="Registration deadline" error={fieldError('registration_deadline')} required>
          {(p) => (
            <input {...p} type="datetime-local" value={form.registration_deadline} onChange={update('registration_deadline')} />
          )}
        </FormField>
      </Section>

      <Section title="Registration & publishing">
        <FormField
          label="Maximum participants"
          error={fieldError('capacity')}
          hint="Leave empty for no limit."
        >
          {(p) => <input {...p} type="number" min="1" step="1" value={form.capacity} onChange={update('capacity')} />}
        </FormField>
        {!locked ? (
          <FormField label="Publication status" error={fieldError('status')} hint="Drafts are only visible to organizers.">
            {(p) => (
              <select {...p} value={form.status} onChange={update('status')}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            )}
          </FormField>
        ) : (
          <div>
            <p className="label">Status</p>
            <p className="text-sm text-slate-600 capitalize">{initial.status}</p>
          </div>
        )}
      </Section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link to="/organizer/events" className="btn-secondary">
          Cancel
        </Link>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
