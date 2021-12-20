import {Dispatch, SetStateAction, useEffect, useRef, useState} from 'react';

import {useAppSelector} from '@redux/hooks';
import {getTargetClusterNamespaces} from '@redux/services/resource';

export const ALL_NAMESPACES = '<all>';
export const NO_NAMESPACE = '<none>';

export function useTargetClusterNamespaces(options: {
  extra?: ('all' | 'none' | 'default')[];
}): [string[], Dispatch<SetStateAction<string[]>>] {
  const context = useAppSelector(state => state.config.kubeConfig.currentContext);
  const kubeconfigPath = useAppSelector(state => state.config.kubeconfigPath);

  const optionsExtra = useRef<string[]>([]);
  optionsExtra.current = options.extra || [];

  const [namespaces, setNamespaces] = useState<string[]>([]);

  useEffect(() => {
    const setClusterNamespaces = async () => {
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
          ...(await getTargetClusterNamespaces(kubeconfigPath, context || '')),
        ]),
      ]);
    };

    setClusterNamespaces();
  }, [context, kubeconfigPath]);

  return [namespaces, setNamespaces];
}
