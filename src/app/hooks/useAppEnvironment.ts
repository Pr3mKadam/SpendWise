import { useState, useEffect } from 'react';

export function useAppEnvironment() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleViewportResize = () => {
      const vv = window.visualViewport;
      if (!vv) return;
      const heightDiff = window.innerHeight - vv.height - vv.offsetTop;
      if (heightDiff > 100) {
        setKeyboardOffset(heightDiff);
      } else {
        setKeyboardOffset(0);
      }
      const kbHeight = window.innerHeight - vv.height - vv.offsetTop;
      document.documentElement.style.setProperty(
        '--kb-inset',
        `${Math.max(0, kbHeight)}px`
      );
    };
    
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportResize);
      window.visualViewport.addEventListener('scroll', handleViewportResize);
      handleViewportResize();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportResize);
        window.visualViewport.removeEventListener('scroll', handleViewportResize);
      }
    };
  }, []);

  return { isOffline, keyboardOffset };
}
