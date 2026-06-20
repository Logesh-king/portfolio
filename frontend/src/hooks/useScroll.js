import { useEffect } from 'react';

export function useScroll(callback) {
  useEffect(() => {
    let ticking = false;
    
    const onScroll = (e) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
          callback({ scrollY, progress, event: e });
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    
    // Initial call
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
    callback({ scrollY, progress, event: null });

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [callback]);
}
