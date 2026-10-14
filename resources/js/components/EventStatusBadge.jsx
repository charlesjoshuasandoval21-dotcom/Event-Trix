const STATUS_STYLES = {
  draft: 'bg-slate-100 text-slate-700 ring-slate-300',
  published: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  completed: 'bg-navy-100 text-navy-800 ring-navy-200',
  cancelled: 'bg-red-50 text-red-700 ring-red-200',
  registered: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
};

const LABELS = {
  draft: 'Draft',
  published: 'Published',
  completed: 'Completed',
  cancelled: 'Cancelled',
  registered: 'Registered',
};

export default function EventStatusBadge({ status, label }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
        STATUS_STYLES[status] || STATUS_STYLES.draft
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          { published: 'bg-emerald-500', registered: 'bg-emerald-500', cancelled: 'bg-red-500', completed: 'bg-navy-500' }[status] ||
          'bg-slate-400'
        }`}
      />
      {label || LABELS[status] || status}
    </span>
  );
}

const AVAILABILITY = {
  open: { text: 'Registration open', cls: 'bg-electric-50 text-electric-700 ring-electric-200' },
  full: { text: 'Event full', cls: 'bg-amber-50 text-amber-800 ring-amber-200' },
  closed: { text: 'Registration closed', cls: 'bg-slate-100 text-slate-700 ring-slate-300' },
  ended: { text: 'Event ended', cls: 'bg-slate-100 text-slate-700 ring-slate-300' },
  completed: { text: 'Completed', cls: 'bg-navy-100 text-navy-800 ring-navy-200' },
  cancelled: { text: 'Cancelled', cls: 'bg-red-50 text-red-700 ring-red-200' },
  unavailable: { text: 'Unavailable', cls: 'bg-slate-100 text-slate-700 ring-slate-300' },
};

export function AvailabilityBadge({ registration }) {
  const key = registration?.open ? 'open' : registration?.reason || 'unavailable';
  const a = AVAILABILITY[key] || AVAILABILITY.unavailable;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${a.cls}`}>
      {a.text}
    </span>
  );
}
