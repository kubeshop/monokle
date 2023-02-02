import {useCallback} from 'react';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {localResourceMetaMapSelector} from '@redux/selectors/resourceMapSelectors';
import {getLocalResourceMetasForPath} from '@redux/services/fileEntry';
import {getHelmValuesFile} from '@redux/services/helm';
import {isKustomizationResource} from '@redux/services/kustomize';
import {startPreview} from '@redux/services/preview';

export const usePreview = () => {
  const localResourceMetaMap = useAppSelector(localResourceMetaMapSelector);
  const fileMap = useAppSelector(state => state.main.fileMap);
  const helmValuesMap = useAppSelector(state => state.main.helmValuesMap);

  const dispatch = useAppDispatch();

  const onPreview = useCallback(
    (relativePath: string) => {
      const resourceMetas = getLocalResourceMetasForPath(relativePath, localResourceMetaMap);
      if (resourceMetas && resourceMetas.length === 1 && isKustomizationResource(resourceMetas[0])) {
        startPreview({type: 'kustomize', kustomizationId: resourceMetas[0].id}, dispatch);
      } else {
        const fileEntry = fileMap[relativePath];
        if (fileEntry) {
          const valuesFile = getHelmValuesFile(fileEntry, helmValuesMap);
          if (valuesFile) {
            startPreview({type: 'helm', valuesFileId: valuesFile.id, chartId: valuesFile.helmChartId}, dispatch);
          }
        }
      }
    },
    [dispatch, fileMap, helmValuesMap, localResourceMetaMap]
  );

  return {onPreview};
};
