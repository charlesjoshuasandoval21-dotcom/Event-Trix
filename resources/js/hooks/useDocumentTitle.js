import { useEffect } from 'react';

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · Eventrix` : 'Eventrix — Where IT Events Happen.';
  }, [title]);
}
