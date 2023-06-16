import {useEffect, useRef} from 'react';

import {trackEvent} from '@shared/utils/telemetry';

export function useSessionTime() {
  const sessionStartTimeRef = useRef(Date.now());
  useEffect(() => {
    const beforeUnload = () => {
      // will calculate time spent on this session in seconds
      const timeSpent = Math.floor((Date.now() - sessionStartTimeRef.current) / 1000);
      trackEvent('APP_SESSION_END', {timeSpent});
    };
    window.addEventListener('beforeunload', beforeUnload);
    return () => {
      window.removeEventListener('beforeunload', beforeUnload);
    };
  }, []);
}
