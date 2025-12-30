import { useState, useEffect } from 'react';

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(() => {
    // Check on initial render (SSR-safe)
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const checkMobile = () => {
      // Check window width (mobile = < 768px)
      // Also check for touch device and user agent
      const width = window.innerWidth;
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isMobileUserAgent = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      // Mobile if: width < 768 OR (touch device AND mobile user agent)
      setIsMobile(width < 768 || (isTouchDevice && isMobileUserAgent));
    };

    // Check on mount
    checkMobile();
    
    // Listen for resize events
    window.addEventListener('resize', checkMobile);
    window.addEventListener('orientationchange', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, []);

  return isMobile;
};

