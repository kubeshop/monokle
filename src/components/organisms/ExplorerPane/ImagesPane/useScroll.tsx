import {useLayoutEffect, useMemo, useRef} from 'react';
import {usePrevious} from 'react-use';

import fastDeepEqual from 'fast-deep-equal';

import {useSelectorWithRef} from '@utils/hooks';

import {ImageNode} from '@shared/models/appState';

type ScrollType = {
  list: ImageNode[];
  scrollTo: (index: number) => void;
};

export function useScroll({scrollTo, list}: ScrollType) {
  const [selection, selectionRef] = useSelectorWithRef(state => state.main.selection);
  const previousSelection = usePrevious(selection);
  const changed = useMemo(() => !fastDeepEqual(selection, previousSelection), [selection, previousSelection]);
  const listRef = useRef(list);
  listRef.current = list;
  const scrollToRef = useRef(scrollTo);
  scrollToRef.current = scrollTo;

  useLayoutEffect(() => {
    if (!selectionRef.current || !changed) {
      return;
    }

    let imageIdToScrollTo: string | undefined;

    // TODO: Add scrolling for image highlighting

    if (selectionRef.current.type === 'image') {
      imageIdToScrollTo = selectionRef.current.imageId;
    }

    const index = listRef.current.findIndex(item => item.type === 'image' && item.id === imageIdToScrollTo);

    if (index === -1) return;
    scrollToRef.current(index);
  }, [changed, selectionRef]);
}
