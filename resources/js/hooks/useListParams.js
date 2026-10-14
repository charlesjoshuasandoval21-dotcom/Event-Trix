import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

export function useListParams(defaults = {}) {
  const [params, setParams] = useSearchParams();

  const values = { ...defaults };
  Object.keys(defaults).forEach((key) => {
    if (params.has(key)) values[key] = params.get(key);
  });
  values.page = Number(params.get('page')) || 1;

  const set = useCallback(
    (patch) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          Object.entries(patch).forEach(([k, v]) => {
            if (v === '' || v === null || v === undefined || v === defaults[k]) next.delete(k);
            else next.set(k, String(v));
          });
          if (!('page' in patch)) next.delete('page');
          if (next.get('page') === '1') next.delete('page');
          return next;
        },
        { replace: true }
      );
    },

    [setParams]
  );

  const clear = useCallback(() => setParams({}, { replace: true }), [setParams]);
  const active = Object.keys(defaults).some((k) => values[k] !== defaults[k]);

  return { values, set, clear, active };
}
