export default function PageHeader({ title, description, actions, eyebrow }) {
  return (
    <div className="mb-7 flex flex-col gap-4 border-b border-navy-900/15 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h1 className="break-words text-3xl font-bold leading-tight sm:text-4xl">{title}</h1>
        {description && <p className="mt-1.5 text-sm text-slate-600">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
