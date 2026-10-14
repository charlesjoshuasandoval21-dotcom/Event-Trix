import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ label = 'Loading…', className = '' }) {
  return (
    <div className={`flex items-center justify-center gap-3 py-16 text-slate-500 ${className}`} role="status">
      <Loader2 className="h-5 w-5 animate-spin text-electric-600" aria-hidden="true" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-950">
      <Loader2 className="h-8 w-8 animate-spin text-electric-400" aria-label="Loading" />
    </div>
  );
}
