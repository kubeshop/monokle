import {useCallback} from 'react';

import {debounce} from 'lodash';
import log from 'loglevel';

import {useAppDispatch} from '@redux/hooks';
import {updateFileEntry} from '@redux/thunks/updateFileEntry';
import {updateResource} from '@redux/thunks/updateResource';

import {AppDispatch} from '@shared/models/appDispatch';
import {ResourceMetaMap} from '@shared/models/k8sResource';

const debouncedCodeSave = debounce(
  (payload: {
    code: string;
    resourceMetaMap: ResourceMetaMap;
    selectedResourceId: string | undefined;
    selectedPath: string | undefined;
    dispatch: AppDispatch;
  }) => {
    const {code, resourceMetaMap, selectedPath, selectedResourceId, dispatch} = payload;
    const resourceMeta = selectedResourceId ? resourceMetaMap[selectedResourceId] : undefined;

    // is a file and no resource selected?
    if (selectedPath && !resourceMeta) {
      try {
        console.log('fac update la fisier');
        dispatch(updateFileEntry({path: selectedPath, text: code}));
        return true;
      } catch (e) {
        log.warn(`Failed to update file ${e}`, dispatch);
        return false;
      }
    } else if (selectedResourceId && resourceMeta) {
      try {
        dispatch(updateResource({resourceIdentifier: resourceMeta, text: code}));
        return true;
      } catch (e) {
        log.warn(`Failed to update resource ${e}`, dispatch);
        return false;
      }
    }
  },
  500
);

function useDebouncedCodeSave(
  originalCodeRef: React.MutableRefObject<string>,
  resourceMetaMapRef: React.MutableRefObject<ResourceMetaMap>,
  selectedResourceIdRef: React.MutableRefObject<string | undefined>,
  selectedPathRef: React.MutableRefObject<string | undefined>
) {
  const dispatch = useAppDispatch();
  const debouncedSaveContent = useCallback(
    (code: string) => {
      const success = debouncedCodeSave({
        code,
        resourceMetaMap: resourceMetaMapRef.current,
        selectedResourceId: selectedResourceIdRef.current,
        selectedPath: selectedPathRef.current,
        dispatch,
      });
      if (success) {
        originalCodeRef.current = code;
      }
    },
    [dispatch, originalCodeRef, resourceMetaMapRef, selectedPathRef, selectedResourceIdRef]
  );

  return debouncedSaveContent;
}

export default useDebouncedCodeSave;
