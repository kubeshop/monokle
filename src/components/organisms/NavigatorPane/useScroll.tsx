import {useLayoutEffect, useMemo, useRef} from 'react';
import {usePrevious} from 'react-use';

import {useRefSelector, useSelectorWithRef} from '@utils/hooks';

import {ResourceNavigatorNode} from '@shared/models/navigator';
import {isResourceSelection} from '@shared/models/selection';
import {isEqual} from '@shared/utils/isEqual';

/**
 * Scrolls the navigator to resources of interest.
 */
export function useScroll({scrollTo, list}: {scrollTo: (index: number) => void; list: ResourceNavigatorNode[]}) {
  const [selection, selectionRef] = useSelectorWithRef(state => state.main.selection);
  const previousSelection = usePrevious(selection);
  const changed = useMemo(() => !isEqual(selection, previousSelection), [selection, previousSelection]);
  const highlightsRef = useRefSelector(state => state.main.highlights);
  const listRef = useRef(list);
  listRef.current = list;
  const scrollToRef = useRef(scrollTo);
  scrollToRef.current = scrollTo;

  useLayoutEffect(() => {
    if (!selectionRef.current || !changed) {
      return;
    }

    let resourceIdToScrollTo: string | undefined;

    if (selectionRef.current.type === 'file') {
      const firstResourceHighlight = highlightsRef.current.find(h => h.type === 'resource');
      if (isResourceSelection(firstResourceHighlight)) {
        resourceIdToScrollTo = firstResourceHighlight.resourceIdentifier.id;
      }
    }

    if (selectionRef.current.type === 'resource') {
      resourceIdToScrollTo = selectionRef.current.resourceIdentifier.id;
    }

    const index = listRef.current.findIndex(
      item => item.type === 'resource' && item.identifier.id === resourceIdToScrollTo
    );
    if (index === -1) return;
    scrollToRef.current(index);
  }, [changed, selectionRef, highlightsRef]);
}
