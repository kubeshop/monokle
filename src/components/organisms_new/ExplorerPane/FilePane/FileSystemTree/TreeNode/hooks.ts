import {useCallback, useMemo} from 'react';

import {useAppDispatch} from '@redux/hooks';
import {useResourceMetaMapRef} from '@redux/selectors/resourceMapSelectors';
import {getHelmValuesFile} from '@redux/services/helm';
import {isKustomizationFile} from '@redux/services/kustomize';

// import {dispatchDeleteAlert} from '@utils/files';
import {useRefSelector} from '@utils/hooks';

import {FileEntry} from '@shared/models/fileEntry';

export const useCanPreview = (fileEntry?: FileEntry) => {
  const localResourceMetaMapRef = useResourceMetaMapRef('local');
  const helmValuesMapRef = useRefSelector(state => state.main.helmValuesMap);

  return useMemo((): boolean => {
    if (!fileEntry) {
      return false;
    }
    return (
      isKustomizationFile(fileEntry, localResourceMetaMapRef.current) ||
      getHelmValuesFile(fileEntry, helmValuesMapRef.current) !== undefined
    );
  }, [fileEntry, localResourceMetaMapRef, helmValuesMapRef]);
};

export const useDelete = (fileEntry?: FileEntry) => {
  const dispatch = useAppDispatch();

  return useCallback(() => {
    // dispatchDeleteAlert(dispatch);
  }, [dispatch]);
};
