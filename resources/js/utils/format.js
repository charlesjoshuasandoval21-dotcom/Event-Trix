

export const APP_TIMEZONE = import.meta.env.VITE_APP_TIMEZONE || 'Asia/Manila';

const fmt = (options) => new Intl.DateTimeFormat('en-US', { timeZone: APP_TIMEZONE, ...options });

const dateFmt = fmt({ month: 'short', day: 'numeric', year: 'numeric' });
const longDateFmt = fmt({ weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
const timeFmt = fmt({ hour: 'numeric', minute: '2-digit' });
const monthFmt = fmt({ month: 'short' });
const dayFmt = fmt({ day: '2-digit' });

export const formatDate = (iso) => (iso ? dateFmt.format(new Date(iso)) : '—');
export const formatLongDate = (iso) => (iso ? longDateFmt.format(new Date(iso)) : '—');
export const formatTime = (iso) => (iso ? timeFmt.format(new Date(iso)) : '—');
export const formatDateTime = (iso) => (iso ? `${formatDate(iso)}, ${formatTime(iso)}` : '—');
export const monthShort = (iso) => monthFmt.format(new Date(iso));
export const dayOfMonth = (iso) => dayFmt.format(new Date(iso));

export function formatRange(startIso, endIso) {
  if (!startIso || !endIso) return '';
  const sameDay = dateFmt.format(new Date(startIso)) === dateFmt.format(new Date(endIso));
  return sameDay
    ? `${formatDate(startIso)} · ${formatTime(startIso)} – ${formatTime(endIso)}`
    : `${formatDateTime(startIso)} → ${formatDateTime(endIso)}`;
}

export function toDateTimeLocal(iso) {
  if (!iso) return '';
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: APP_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  })
    .format(new Date(iso))
    .replace(' ', 'T');
}

export const pluralize = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

const weekdayFmt = fmt({ weekday: 'short' });
export const weekdayShort = (iso) => weekdayFmt.format(new Date(iso));
