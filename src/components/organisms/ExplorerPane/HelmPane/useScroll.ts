import {useLayoutEffect, useMemo, useRef} from 'react';
import {usePrevious} from 'react-use';

import {useRefSelector, useSelectorWithRef} from '@utils/hooks';

import {HelmListNode} from '@shared/models/helm';
import {isEqual} from '@shared/utils/isEqual';

type ScrollType = {
  list: HelmListNode[];
  scrollTo: (index: number) => void;
};

export function useScroll({scrollTo, list}: ScrollType) {
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

    let helmChartFilePathToScrollTo: string | undefined;
    let helmValueIdToScrollTo: string | undefined;

    // helm chart
    if (selectionRef.current.type === 'file') {
      helmChartFilePathToScrollTo = selectionRef.current.filePath;
    }

    // helm value
    if (selectionRef.current.type === 'helm.values.file') {
      helmValueIdToScrollTo = selectionRef.current.valuesFileId;
    }

    let index: number = -1;

    if (helmChartFilePathToScrollTo) {
      index = listRef.current.findIndex(
        item => item.type === 'helm-chart' && item.filePath === helmChartFilePathToScrollTo
      );
    } else if (helmValueIdToScrollTo) {
      index = listRef.current.findIndex(item => item.type === 'helm-value' && item.id === helmValueIdToScrollTo);
    }

    if (index === -1) return;
    scrollToRef.current(index);
  }, [changed, highlightsRef, selectionRef]);
}
