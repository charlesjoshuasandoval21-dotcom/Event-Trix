import { useEffect, useState } from 'react';
import CategoryIcon from './CategoryIcon';

export default function EventBanner({ src, category, alt = '', className = '', iconClass = 'h-10 w-10' }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [src]);

  if (!src || failed) {
    return (
      <div
        className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-electric-700 text-white/80 ${className}`}
        role="img"
        aria-label={alt || 'Event banner placeholder'}
      >
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.15)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.15)_1px,transparent_1px)] [background-size:24px_24px]" />
        <CategoryIcon category={category} className={`relative ${iconClass}`} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
}
