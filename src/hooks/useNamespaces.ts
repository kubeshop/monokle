import {useState, useEffect, useCallback} from 'react';
import {useAppSelector} from '@redux/hooks';
import {getNamespaces} from '@redux/services/resource';

export const ALL_NAMESPACES = '<all>';
export const NO_NAMESPACE = '<none>';

export function useNamespaces(options?: {extra?: ('all' | 'none' | 'default')[]}) {
  const resourceMap = useAppSelector(state => state.main.resourceMap);

  const [namespaces, setNamespaces] = useState<string[]>([]);

  const getExtraNamespaces = useCallback(() => {
    return options?.extra || [];
  }, [options]);

  useEffect(() => {
    setNamespaces([
      ...new Set([
        ...getExtraNamespaces().map(opt => {
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
  }, [resourceMap, getExtraNamespaces]);

  return namespaces;
}
