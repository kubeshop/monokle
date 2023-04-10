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
    localResourceMetaMap: ResourceMetaMap;
    activeResourceMetaMap: ResourceMetaMap;
    selectedResourceId: string | undefined;
    selectedPath: string | undefined;
    dispatch: AppDispatch;
  }) => {
    const {code, activeResourceMetaMap, localResourceMetaMap, selectedPath, selectedResourceId, dispatch} = payload;
    const resourceMeta = selectedResourceId
      ? activeResourceMetaMap[selectedResourceId] || localResourceMetaMap[selectedResourceId]
      : undefined;

    // is a file and no resource selected?
    if (selectedPath && !resourceMeta) {
      try {
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
  localResourceMetaMapRef: React.MutableRefObject<ResourceMetaMap>,
  activeResourceMetaMapRef: React.MutableRefObject<ResourceMetaMap>,
  selectedResourceIdRef: React.MutableRefObject<string | undefined>,
  selectedPathRef: React.MutableRefObject<string | undefined>
) {
  const dispatch = useAppDispatch();
  const debouncedSaveContent = useCallback(
    (code: string) => {
      const success = debouncedCodeSave({
        code,
        localResourceMetaMap: localResourceMetaMapRef.current,
        activeResourceMetaMap: activeResourceMetaMapRef.current,
        selectedResourceId: selectedResourceIdRef.current,
        selectedPath: selectedPathRef.current,
        dispatch,
      });
      if (success) {
        originalCodeRef.current = code;
      }
    },
    [
      localResourceMetaMapRef,
      activeResourceMetaMapRef,
      selectedResourceIdRef,
      selectedPathRef,
      dispatch,
      originalCodeRef,
    ]
  );

  return debouncedSaveContent;
}

export default useDebouncedCodeSave;
