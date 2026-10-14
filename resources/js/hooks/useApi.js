import { useCallback, useEffect, useRef, useState } from 'react';
import { getErrorMessage } from '../utils/errors';

export function useApi(fetcher, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null, status: null });
  const counter = useRef(0);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const run = useCallback(async () => {
    const id = ++counter.current;
    setState((s) => ({ ...s, loading: true, error: null, status: null }));
    try {
      const data = await fetcherRef.current();
      if (id === counter.current) setState({ data, loading: false, error: null, status: null });
    } catch (err) {
      if (id === counter.current) {
        setState((s) => ({ ...s, loading: false, error: getErrorMessage(err), status: err.response?.status ?? 0 }));
      }
    }
  }, []);

  useEffect(() => {
    run();
  }, deps);

  return { ...state, reload: run };
}
