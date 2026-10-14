import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import EventForm from '../../components/EventForm';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState, { ErrorState } from '../../components/EmptyState';
import { useToast } from '../../context/ToastContext';
import { useApi } from '../../hooks/useApi';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { organizerService } from '../../services/eventService';
import { getErrorMessage, getFieldErrors } from '../../utils/errors';

export default function EventEdit() {
  const { id } = useParams();
  useDocumentTitle('Edit event');
  const navigate = useNavigate();
  const toast = useToast();
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const { data: event, loading, error, status, reload } = useApi(() => organizerService.event(id), [id]);

  const submit = async (payload) => {
    setSubmitting(true);
    setErrors({});
    try {
      await organizerService.update(id, payload);
      toast.success('Event updated.');
      navigate(`/organizer/events/${id}`);
    } catch (err) {
      const fields = getFieldErrors(err);
      setErrors(fields);
      toast.error(Object.keys(fields).length ? 'Please fix the highlighted fields.' : getErrorMessage(err));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

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

  return (
    <>
      <Link to={`/organizer/events/${id}`} className="mb-3 inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-electric-700">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to event
      </Link>
      <PageHeader title="Edit event" description={event.title} />
      <div className="max-w-4xl">
        <EventForm initial={event} errors={errors} submitting={submitting} onSubmit={submit} submitLabel="Save changes" />
      </div>
    </>
  );
}
