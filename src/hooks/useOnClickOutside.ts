import {RefObject, useEffect} from 'react';

type AnyEvent = MouseEvent | TouchEvent;

export const useOnClickOutside = (ref: RefObject<any>, touchEndCb: (event: AnyEvent) => void): void => {
  useEffect(() => {
    const onTouchEndListener = (event: AnyEvent) => {
      const el = ref?.current;

      if (!el || el.contains(event.target as Node)) {
        return;
      }

      touchEndCb(event);
    };

    document.addEventListener(`mouseup`, onTouchEndListener);
    document.addEventListener(`touchend`, onTouchEndListener);

    return () => {
      document.removeEventListener(`mouseup`, onTouchEndListener);
      document.removeEventListener(`touchend`, onTouchEndListener);
    };
  }, [ref, touchEndCb]);
};
