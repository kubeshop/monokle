import {useLayoutEffect, useMemo, useRef} from 'react';
import {usePrevious} from 'react-use';

import fastDeepEqual from 'fast-deep-equal';

import {useRefSelector, useSelectorWithRef} from '@utils/hooks';

import {ImageNode} from '@shared/models/appState';
import {isImageSelection} from '@shared/models/selection';

type ScrollType = {
  list: ImageNode[];
  scrollTo: (index: number) => void;
};

export function useScroll({scrollTo, list}: ScrollType) {
  const [selection, selectionRef] = useSelectorWithRef(state => state.main.selection);
  const previousSelection = usePrevious(selection);
  const changed = useMemo(() => !fastDeepEqual(selection, previousSelection), [selection, previousSelection]);
  const highlightsRef = useRefSelector(state => state.main.highlights);
  const listRef = useRef(list);
  listRef.current = list;
  const scrollToRef = useRef(scrollTo);
  scrollToRef.current = scrollTo;

  useLayoutEffect(() => {
    if (!selectionRef.current || !changed) {
      return;
    }

    let imageIdToScrollTo: string | undefined;

    if (selectionRef.current.type === 'resource') {
      const firstImageHighlight = highlightsRef.current.find(h => h.type === 'image');
      if (isImageSelection(firstImageHighlight)) {
        imageIdToScrollTo = firstImageHighlight.imageId;
      }
    }

    if (selectionRef.current.type === 'image') {
      imageIdToScrollTo = selectionRef.current.imageId;
    }

    const index = listRef.current.findIndex(item => item.type === 'image' && item.id === imageIdToScrollTo);

    if (index === -1) return;
    scrollToRef.current(index);
  }, [changed, highlightsRef, selectionRef]);
}
