import { useState } from 'react';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { useToast } from '../context/ToastContext';
import { organizerService } from '../services/eventService';
import { getErrorMessage } from '../utils/errors';

const STATUS_COPY = {
  published: {
    title: 'Publish this event?',
    body: 'It will become visible to everyone and students can start registering.',
    label: 'Publish',
    done: 'Event published.',
  },
  draft: {
    title: 'Unpublish this event?',
    body: 'It will be hidden from the public and moved back to drafts.',
    label: 'Unpublish',
    done: 'Event moved back to drafts.',
  },
  completed: {
    title: 'Mark this event as completed?',
    body: 'Registration will be closed permanently for this event.',
    label: 'Mark completed',
    done: 'Event marked as completed.',
  },
  cancelled: {
    title: 'Cancel this event?',
    body: 'The event stays visible but is labelled as cancelled, and nobody can register.',
    label: 'Cancel event',
    done: 'Event cancelled.',
    danger: true,
  },
};

export function useEventActions(onDone) {
  const toast = useToast();
  const [pending, setPending] = useState(null);
  const [busy, setBusy] = useState(false);

  const close = () => !busy && setPending(null);

  const run = async () => {
    if (!pending) return;
    setBusy(true);
    try {
      if (pending.type === 'delete') {
        await organizerService.remove(pending.event.id);
        toast.success('Event deleted.');
      } else {
        await organizerService.setStatus(pending.event.id, pending.status);
        toast.success(STATUS_COPY[pending.status].done);
      }
      setPending(null);
      await onDone?.(pending);
    } catch (err) {
      const fieldMsg = err.response?.data?.errors && Object.values(err.response.data.errors)[0]?.[0];
      toast.error(fieldMsg || getErrorMessage(err));
      setPending(null);
    } finally {
      setBusy(false);
    }
  };

  let copy = null;
  if (pending?.type === 'delete') {
    const n = pending.event.registered_count;
    copy = {
      title: 'Delete this event?',
      body: `"${pending.event.title}" will be permanently deleted${
        n > 0 ? `, together with its ${n} active registration${n === 1 ? '' : 's'}` : ''
      }. This cannot be undone.`,
      label: 'Delete event',
      danger: true,
    };
  } else if (pending) {
    copy = { ...STATUS_COPY[pending.status], body: STATUS_COPY[pending.status].body };
  }

  const dialog = (
    <ConfirmationDialog
      open={!!pending}
      title={copy?.title}
      description={copy?.body}
      confirmLabel={copy?.label}
      danger={copy?.danger}
      loading={busy}
      onConfirm={run}
      onCancel={close}
    />
  );

  return { ask: setPending, dialog };
}
