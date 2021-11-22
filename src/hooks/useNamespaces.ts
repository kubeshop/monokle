import {useEffect, useRef, useState} from 'react';

import {useAppSelector} from '@redux/hooks';
import {getNamespaces} from '@redux/services/resource';

export const ALL_NAMESPACES = '<all>';
export const NO_NAMESPACE = '<none>';

export function useNamespaces(options: {extra?: ('all' | 'none' | 'default')[]}) {
  const resourceMap = useAppSelector(state => state.main.resourceMap);
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
        ...getNamespaces(resourceMap),
      ]),
    ]);
  }, [resourceMap, setNamespaces]);

  return namespaces;
}
