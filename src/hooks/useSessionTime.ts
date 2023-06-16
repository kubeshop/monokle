import {useEffect} from 'react';

import {trackEvent} from '@shared/utils/telemetry';

let sessionStartTimestamp: number = Date.now();

export function useSessionTime() {
  useEffect(() => {
    window.addEventListener('beforeunload', () => {
      // will calculate time spent on this session in seconds
      trackEvent('APP_SESSION_END', {timeSpent: Math.floor((Date.now() - sessionStartTimestamp) / (1000 * 60 * 60))});
    });
  }, []);
}
