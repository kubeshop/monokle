import React, {MutableRefObject, useEffect, useRef, useState} from 'react';
import {useStore} from 'react-redux';

import {useAppSelector} from '@redux/hooks';

import {RootState} from '@shared/models/rootState';
import {Size} from '@shared/models/window';

export function useFocus<T>(): [React.RefObject<T>, () => void] {
  const htmlElRef = useRef<T>(null);
  const focus = () => {
    const current = htmlElRef.current;
    if (current && typeof current === 'object' && 'focus' in current && typeof current.focus === 'function')
      current.focus();
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
    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty array ensures that effect is only run on mount
  return windowSize;
}

export const useStateWithRef = <T>(initialState: T): [T, (arg1: T) => void, MutableRefObject<T>] => {
  const [state, _setState] = React.useState(initialState);
  const ref = React.useRef(state);
  const setState = React.useCallback((newState: T) => {
    if (typeof newState === 'function') {
      _setState((prevState: T) => {
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

export const useRefSelector = <T>(selector: (state: RootState) => T): MutableRefObject<T> => {
  const store = useStore<RootState>();
  const storeRef = useRef(store);
  storeRef.current = store;
  const selectorRef = useRef(selector);
  selectorRef.current = selector;

  const valueRef = useRef(selector(store.getState()));

  useEffect(() => {
    const unsubscribe = storeRef.current.subscribe(() => {
      valueRef.current = selectorRef.current(storeRef.current.getState());
    });
    return () => unsubscribe();
  }, []);

  return valueRef;
};

type HookComponent<Props> = {
  (props: Props): JSX.Element;
  componentProps?: Props;
};

export function createUseComponentHook<Props>(component: (props?: Props) => JSX.Element) {
  const useComponent = (componentProps: Props) => {
    const componentRef = useRef<HookComponent<Props> | null>(null);
    if (componentRef.current) {
      componentRef.current.componentProps = componentProps;
    }
    useEffect(() => {
      if (componentRef.current) {
        return;
      }
      const hookComponent: HookComponent<Props> = () => component(hookComponent.componentProps);
      componentRef.current = hookComponent;
    }, []);
    return (componentRef.current === null ? () => null : componentRef.current) as () => JSX.Element;
  };
  return useComponent;
}
