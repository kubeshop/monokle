import * as k8s from '@kubernetes/client-node';

import {Dispatch, SetStateAction, useEffect, useRef, useState} from 'react';

import {useAppSelector} from '@redux/hooks';
import {getTargetClusterNamespaces} from '@redux/services/resource';

import NamespaceHandler from '@src/kindhandlers/Namespace.handler';

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
      const kc = new k8s.KubeConfig();
      kc.loadFromFile(kubeconfigPath);
      kc.setCurrentContext(context || '');

      const ns = await NamespaceHandler.listResourcesInCluster(kc);

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
          ...getTargetClusterNamespaces(ns),
        ]),
      ]);
    };

    setClusterNamespaces();
  }, [context, kubeconfigPath]);

  return [namespaces, setNamespaces];
}
