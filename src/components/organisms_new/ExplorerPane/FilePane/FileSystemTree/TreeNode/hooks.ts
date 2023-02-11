import {useCallback, useMemo} from 'react';

import {useAppDispatch} from '@redux/hooks';
import {useResourceMetaMapRef} from '@redux/selectors/resourceMapSelectors';
import {getHelmValuesFile} from '@redux/services/helm';
import {isKustomizationFile} from '@redux/services/kustomize';

import {deleteFileEntry, dispatchDeleteAlert, isFileEntryDisabled} from '@utils/files';
import {useRefSelector} from '@utils/hooks';

import {FileEntry} from '@shared/models/fileEntry';

export const useCanPreview = (fileEntry?: FileEntry, isDisabled?: boolean) => {
  const localResourceMetaMapRef = useResourceMetaMapRef('local');
  const helmValuesMapRef = useRefSelector(state => state.main.helmValuesMap);

  return useMemo((): boolean => {
    if (!fileEntry || isDisabled) {
      return false;
    }
    return (
      isKustomizationFile(fileEntry, localResourceMetaMapRef.current) ||
      getHelmValuesFile(fileEntry, helmValuesMapRef.current) !== undefined
    );
  }, [fileEntry, isDisabled, localResourceMetaMapRef, helmValuesMapRef]);
};

export const useDelete = (fileEntry?: FileEntry) => {
  const dispatch = useAppDispatch();

  return useCallback(() => {
    if (!fileEntry) {
      return;
    }
    deleteFileEntry(fileEntry).then(result => dispatchDeleteAlert(dispatch, result));
  }, [fileEntry, dispatch]);
};

export const useIsDisabled = (fileEntry?: FileEntry) => {
  const isDisabled = useMemo(() => {
    return isFileEntryDisabled(fileEntry);
  }, [fileEntry]);
  return isDisabled;
};
