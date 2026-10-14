
export default function StatStrip({ cells }) {
  return (
    <dl
      className={`grid grid-cols-2 gap-px border border-navy-900/20 bg-navy-900/20 ${
        cells.length === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
      }`}
    >
      {cells.map((c) => (
        <div key={c.label} className={`p-5 ${c.accent ? 'bg-navy-900 text-white' : 'bg-white'}`}>
          <dt className={`eyebrow ${c.accent ? '!text-electric-300' : ''}`}>{c.label}</dt>
          <dd
            className={`mt-3 font-display text-5xl font-extrabold leading-none tabular-nums ${
              c.accent ? 'text-white' : 'text-navy-900'
            }`}
          >
            {c.value ?? '—'}
          </dd>
          {c.hint && (
            <p className={`mt-3 font-mono text-[11px] ${c.accent ? 'text-navy-300' : 'text-slate-500'}`}>{c.hint}</p>
          )}
        </div>
      ))}
    </dl>
  );
}
