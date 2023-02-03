import {Dispatch, SetStateAction, useEffect, useRef, useState} from 'react';

import {useAppSelector} from '@redux/hooks';
import {activeResourceMetaMapSelector} from '@redux/selectors/resourceMapSelectors';
import {getNamespaces} from '@redux/services/resource';

export const ALL_NAMESPACES = '<all>';
export const NO_NAMESPACE = '<none>';

export function useNamespaces(options: {
  extra?: ('all' | 'none' | 'default')[];
}): [string[], Dispatch<SetStateAction<string[]>>] {
  // TODO: maybe this should become a selector
  const activeNamespaces = useAppSelector(state => getNamespaces(activeResourceMetaMapSelector(state)));
  const optionsExtra = useRef<string[]>([]);
  optionsExtra.current = options.extra || [];

  const [namespaces, setNamespaces] = useState<string[]>([]);

  useEffect(() => {
    setNamespaces([
      ...new Set([
        ...optionsExtra.current.map(opt => {
          if (opt === 'all') {
            return ALL_NAMESPACES;
          }
          if (opt === 'none') {
            return NO_NAMESPACE;
          }
          return opt;
        }),
        ...activeNamespaces,
      ]),
    ]);
  }, [activeNamespaces, setNamespaces]);

  return [namespaces, setNamespaces];
}
