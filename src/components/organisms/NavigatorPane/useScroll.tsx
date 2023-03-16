import {useLayoutEffect, useMemo} from 'react';
import {usePrevious} from 'react-use';

import fastDeepEqual from 'fast-deep-equal';

import {useAppSelector} from '@redux/hooks';

import {useRefSelector} from '@utils/hooks';

import {ResourceNavigatorNode} from '@shared/models/navigator';
import {isResourceSelection} from '@shared/models/selection';

/**
 * Scrolls the navigator to resources of interest.
 */
export function useScroll({scrollTo, list}: {scrollTo: (index: number) => void; list: ResourceNavigatorNode[]}) {
  const selection = useAppSelector(state => state.main.selection);
  const previousSelection = usePrevious(selection);
  const changed = useMemo(() => !fastDeepEqual(selection, previousSelection), [selection, previousSelection]);
  const highlightsRef = useRefSelector(state => state.main.highlights);

  useLayoutEffect(() => {
    if (!selection || !changed) {
      return;
    }

    let resourceIdToScrollTo: string | undefined;

    if (selection.type === 'file') {
      const firstResourceHighlight = highlightsRef.current.find(h => h.type === 'resource');
      if (isResourceSelection(firstResourceHighlight)) {
        resourceIdToScrollTo = firstResourceHighlight.resourceIdentifier.id;
      }
    }

    if (selection.type === 'resource') {
      resourceIdToScrollTo = selection.resourceIdentifier.id;
    }

    const index = list.findIndex(item => item.type === 'resource' && item.identifier.id === resourceIdToScrollTo);
    if (index === -1) return;
    scrollTo(index);
  }, [changed]);
}
