import { useEffect, useRef } from 'react';

export function useIntersection(ref, callback, options = {}) {
  const savedCallback = useRef(callback);
  
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const {
      once = false,
      threshold = 0.15,
      rootMargin = '0px'
    } = options;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const isIntersecting = entry.isIntersecting;
        savedCallback.current(isIntersecting, entry, observer);
        
        if (isIntersecting && once) {
          observer.unobserve(el);
        }
      });
    }, { threshold, rootMargin });

    observer.observe(el);

    return () => {
      if (el && !once) {
        observer.unobserve(el);
      }
    };
  }, [ref, options.once, options.threshold, options.rootMargin]);
}
