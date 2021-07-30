import React, {useState, useEffect, useRef} from 'react';
import {Size} from '@models/window';
import {APP_MIN_HEIGHT, APP_MIN_WIDTH} from '@src/constants';

export function useFocus<T>(): [React.RefObject<T>, () => void] {
  const htmlElRef = useRef<T>(null);
  const focus = () => {
    const current = htmlElRef.current;
    // @ts-ignore
    if (current && current.focus) current.focus();
  };

  return [htmlElRef, focus];
}

export function useWindowSize(): Size {
  const [windowSize, setWindowSize] = useState<Size>({
    width: APP_MIN_WIDTH,
    height: APP_MIN_HEIGHT,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    handleResize();
    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty array ensures that effect is only run on mount
  return windowSize;
}
