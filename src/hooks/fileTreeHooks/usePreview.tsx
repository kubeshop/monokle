import {useCallback} from 'react';

import {useAppDispatch} from '@redux/hooks';
import {useResourceMetaMapRef} from '@redux/selectors/resourceMapSelectors';
import {getLocalResourceMetasForPath} from '@redux/services/fileEntry';
import {getHelmValuesFile} from '@redux/services/helm';
import {isKustomizationResource} from '@redux/services/kustomize';
import {startPreview} from '@redux/services/preview';

import {useRefSelector} from '@utils/hooks';

export const usePreview = () => {
  const localResourceMetaMapRef = useResourceMetaMapRef('local');
  const fileMapRef = useRefSelector(state => state.main.fileMap);
  const helmValuesMapRef = useRefSelector(state => state.main.helmValuesMap);

  const dispatch = useAppDispatch();

  const onPreview = useCallback(
    (relativePath: string) => {
      const resourceMetas = getLocalResourceMetasForPath(relativePath, localResourceMetaMapRef.current);
      if (resourceMetas && resourceMetas.length === 1 && isKustomizationResource(resourceMetas[0])) {
        startPreview({type: 'kustomize', kustomizationId: resourceMetas[0].id}, dispatch);
      } else {
        const fileEntry = fileMapRef.current[relativePath];
        if (fileEntry) {
          const valuesFile = getHelmValuesFile(fileEntry, helmValuesMapRef.current);
          if (valuesFile) {
            startPreview({type: 'helm', valuesFileId: valuesFile.id, chartId: valuesFile.helmChartId}, dispatch);
          }
        }
      }
    },
    [dispatch, localResourceMetaMapRef, fileMapRef, helmValuesMapRef]
  );

  return {onPreview};
};
