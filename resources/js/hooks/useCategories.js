import { useEffect, useState } from 'react';
import { eventService } from '../services/eventService';

let cache = null;

export function useCategories() {
  const [categories, setCategories] = useState(cache || []);

  useEffect(() => {
    if (cache) return;
    eventService
      .categories()
      .then((data) => {
        cache = data;
        setCategories(data);
      })
      .catch(() => {});
  }, []);

  return categories;
}
