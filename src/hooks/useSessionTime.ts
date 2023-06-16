import {useEffect} from 'react';

import {trackEvent} from '@shared/utils/telemetry';

let sessionStartTimestamp: number = Date.now();

export function useSessionTime() {
  useEffect(() => {
    window.addEventListener('beforeunload', () => {
      trackEvent('SESSION_END', {timeSpent: Math.floor((Date.now() - sessionStartTimestamp) / (1000 * 60))});
    });
  }, []);
}
