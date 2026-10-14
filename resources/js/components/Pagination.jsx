import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ meta, onChange }) {
  if (!meta || meta.last_page <= 1) return null;

  const { current_page: page, last_page: last } = meta;
  const pages = new Set([1, last, page - 1, page, page + 1]);
  const list = [...pages].filter((p) => p >= 1 && p <= last).sort((a, b) => a - b);

  return (
    <nav className="mt-8 flex flex-col items-center justify-between gap-3 sm:flex-row" aria-label="Pagination">
      <p className="text-sm text-slate-500">
        Showing <span className="font-medium text-slate-700">{meta.from}</span>–
        <span className="font-medium text-slate-700">{meta.to}</span> of{' '}
        <span className="font-medium text-slate-700">{meta.total}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          className="btn-secondary btn-sm"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {list.map((p, i) => (
          <span key={p} className="flex items-center">
            {i > 0 && p - list[i - 1] > 1 && <span className="px-1 text-slate-400">…</span>}
            <button
              onClick={() => onChange(p)}
              aria-current={p === page ? 'page' : undefined}
              className={`btn btn-sm min-w-[2rem] ${
                p === page ? 'bg-navy-900 text-white' : 'border border-slate-300 bg-white text-navy-800 hover:bg-slate-50'
              }`}
            >
              {p}
            </button>
          </span>
        ))}
        <button
          className="btn-secondary btn-sm"
          disabled={page >= last}
          onClick={() => onChange(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}
