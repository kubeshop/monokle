import {useCallback} from 'react';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {getResourcesForPath} from '@redux/services/fileEntry';
import {getHelmValuesFile} from '@redux/services/helm';
import {isKustomizationResource} from '@redux/services/kustomize';
import {startPreview} from '@redux/services/preview';

export const usePreview = () => {
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const fileMap = useAppSelector(state => state.main.fileMap);
  const helmValuesMap = useAppSelector(state => state.main.helmValuesMap);

  const dispatch = useAppDispatch();

  const onPreview = useCallback(
    (relativePath: string) => {
      const resources = getResourcesForPath(relativePath, resourceMap);
      if (resources && resources.length === 1 && isKustomizationResource(resources[0])) {
        startPreview(resources[0].id, 'kustomization', dispatch);
      } else {
        const fileEntry = fileMap[relativePath];
        if (fileEntry) {
          const valuesFile = getHelmValuesFile(fileEntry, helmValuesMap);
          if (valuesFile) {
            startPreview(valuesFile.id, 'helm', dispatch);
          }
        }
      }
    },
    [dispatch, fileMap, helmValuesMap, resourceMap]
  );

  return onPreview;
};
