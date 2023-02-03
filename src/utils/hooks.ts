import React, {MutableRefObject, useEffect, useRef, useState} from 'react';

import {useAppSelector} from '@redux/hooks';

import {RootState} from '@shared/models/rootState';
import {Size} from '@shared/models/window';

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

  const [height, setHeight] = useState<number>(window.innerHeight - layoutSize.header);
  const [width, setWidth] = useState<number>(window.innerWidth - 50);

  useEffect(() => {
    const handleResize = () => {
      setHeight(window.innerHeight - layoutSize.header);
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

export const useStateWithRef = <T>(initialState: T): [T, (arg1: T) => void, MutableRefObject<T>] => {
  const [state, _setState] = React.useState(initialState);
  const ref = React.useRef(state);
  const setState = React.useCallback((newState: any) => {
    if (typeof newState === 'function') {
      _setState((prevState: any) => {
        const computedState = newState(prevState);
        ref.current = computedState;
        return computedState;
      });
    } else {
      ref.current = newState;
      _setState(newState);
    }
  }, []);
  return [state, setState, ref];
};

export const useSelectorWithRef = <T>(selector: (state: RootState) => T): [T, MutableRefObject<T>] => {
  const state = useAppSelector(selector);
  const ref = useRef(state);
  ref.current = state;
  return [state, ref];
};
