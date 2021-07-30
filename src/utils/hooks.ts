import React, {useState, useEffect, useRef} from 'react';
import {Size} from '@models/window';

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
  const {innerWidth, innerHeight} = window;
  const [windowSize, setWindowSize] = useState<Size>({
    width: innerWidth,
    height: innerHeight,
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
