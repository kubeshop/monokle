import {Dispatch, SetStateAction, useEffect, useState} from 'react';

import {currentClusterAccessSelector, kubeConfigContextSelector, kubeConfigPathSelector} from '@redux/appConfig';
import {useAppSelector} from '@redux/hooks';
import {getTargetClusterNamespaces} from '@redux/services/resource';

import {isInClusterModeSelector} from '@shared/utils/selectors';

export const ALL_NAMESPACES = '<all>';
export const NO_NAMESPACE = '<none>';

export function useTargetClusterNamespaces(): [string[], Dispatch<SetStateAction<string[]>>] {
  const kubeConfigContext = useAppSelector(kubeConfigContextSelector);
  const kubeConfigPath = useAppSelector(kubeConfigPathSelector);
  const clusterAccess = useAppSelector(currentClusterAccessSelector);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);

  const [namespaces, setNamespaces] = useState<string[]>([]);

  useEffect(() => {
    const setClusterNamespaces = async () => {
      if (!kubeConfigPath?.trim().length) {
        setNamespaces([]);
        return;
      }

      let clusterNamespaces = await getTargetClusterNamespaces(kubeConfigPath, kubeConfigContext, clusterAccess);
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
  }, [kubeConfigContext, kubeConfigPath, clusterAccess, isInClusterMode]);

  return [namespaces, setNamespaces];
}
