import {Dispatch, SetStateAction, useEffect, useState} from 'react';

import {useAppSelector} from '@redux/hooks';
import {getTargetClusterNamespaces} from '@redux/services/resource';

export const ALL_NAMESPACES = '<all>';
export const NO_NAMESPACE = '<none>';

export function useTargetClusterNamespaces(): [string[], Dispatch<SetStateAction<string[]>>] {
  const context = useAppSelector(state => state.config.kubeConfig.currentContext);
  const kubeconfigPath = useAppSelector(state => state.config.kubeconfigPath);

  const [namespaces, setNamespaces] = useState<string[]>([]);

  useEffect(() => {
    const setClusterNamespaces = async () => {
      let clusterNamespaces = await getTargetClusterNamespaces(kubeconfigPath, context || '');
      clusterNamespaces.sort((a, b) => {
        if (a === 'default') {
          return -1;
        }
        if (b === 'default') {
          return 1;
        }

        return a.toLowerCase() > b.toLowerCase() ? 1 : b.toLowerCase() > a.toLowerCase() ? -1 : 0;
      });

      setNamespaces(clusterNamespaces);
    };

    setClusterNamespaces();
  }, [context, kubeconfigPath]);

  return [namespaces, setNamespaces];
}
