import {useState, useEffect, useMemo, useRef} from 'react';

export function useDelayedUnmount(isVisible: boolean, delayMilliseconds: number) {
  const [isMounted, setIsMounted] = useState(true);
  const timeoutIdRef = useRef<number>();

  const shouldDelayUnmount = useMemo(() => !isVisible && isMounted, [isVisible, isMounted]);

  useEffect(() => {
    if (shouldDelayUnmount) {
      window.clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = window.setTimeout(() => setIsMounted(false), delayMilliseconds);
    }
    return () => window.clearTimeout(timeoutIdRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldDelayUnmount, setIsMounted]);

  return {shouldMount: isMounted, delayedUnmount: () => setIsMounted(false)};
}
