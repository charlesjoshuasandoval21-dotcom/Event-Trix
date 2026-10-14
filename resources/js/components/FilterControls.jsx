import { ChevronDown, FilterX } from 'lucide-react';

export function SelectFilter({ label, value, onChange, options, className = '' }) {
  return (
    <label className={`relative block ${className}`}>
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="input appearance-none pr-9" aria-label={label}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
    </label>
  );
}

export function ClearFilters({ visible, onClear }) {
  if (!visible) return null;
  return (
    <button type="button" onClick={onClear} className="btn-ghost btn-sm whitespace-nowrap">
      <FilterX className="h-4 w-4" aria-hidden="true" />
      Clear filters
    </button>
  );
}

export function SegmentedControl({ value, onChange, options, label }) {
  return (
    <div role="group" aria-label={label} className="inline-flex rounded-lg border border-slate-300 bg-white p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
            value === o.value ? 'bg-navy-900 text-white shadow-sm' : 'text-slate-600 hover:text-navy-900'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
