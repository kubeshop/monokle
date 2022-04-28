import React, {useEffect, useRef, useState} from 'react';

import {Size} from '@models/window';

import {useAppSelector} from '@redux/hooks';

export function useFocus<T>(): [React.RefObject<T>, () => void] {
  const htmlElRef = useRef<T>(null);
  const focus = () => {
    const current = htmlElRef.current;
    // @ts-ignore
    if (current && current.focus) current.focus();
  };

  return [htmlElRef, focus];
}

export function useMainPaneDimensions(): {height: number; width: number} {
  const layoutSize = useAppSelector(state => state.ui.layoutSize);
  const [height, setHeight] = useState<number>(window.innerHeight - layoutSize.footer - layoutSize.header);
  const [width, setWidth] = useState<number>(window.innerWidth - 50);

  useEffect(() => {
    const handleResize = () => {
      setHeight(window.innerHeight - layoutSize.footer - layoutSize.header);
      setWidth(window.innerWidth - 50);
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, [layoutSize]);

  return {height, width};
}

export function useWindowSize(): Size {
  const [windowSize, setWindowSize] = useState<Size>({
    width: window.innerWidth,
    height: window.innerHeight,
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
