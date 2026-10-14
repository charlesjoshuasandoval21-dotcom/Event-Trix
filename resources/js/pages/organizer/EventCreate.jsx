import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import EventForm from '../../components/EventForm';
import { useToast } from '../../context/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { organizerService } from '../../services/eventService';
import { getErrorMessage, getFieldErrors } from '../../utils/errors';

export default function EventCreate() {
  useDocumentTitle('Create event');
  const navigate = useNavigate();
  const toast = useToast();
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const submit = async (payload) => {
    setSubmitting(true);
    setErrors({});
    try {
      const event = await organizerService.create(payload);
      toast.success(event.status === 'published' ? 'Event created and published.' : 'Event saved as a draft.');
      navigate(`/organizer/events/${event.id}`);
    } catch (err) {
      const fields = getFieldErrors(err);
      setErrors(fields);
      toast.error(Object.keys(fields).length ? 'Please fix the highlighted fields.' : getErrorMessage(err));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader title="Create event" description="Fill in the details. You can save it as a draft and publish later." />
      <div className="max-w-4xl">
        <EventForm errors={errors} submitting={submitting} onSubmit={submit} submitLabel="Create event" />
      </div>
    </>
  );
}
