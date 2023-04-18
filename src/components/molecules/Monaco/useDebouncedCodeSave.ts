import {useCallback} from 'react';

import {debounce} from 'lodash';
import log from 'loglevel';

import {useAppDispatch} from '@redux/hooks';
import {updateFileEntry} from '@redux/thunks/updateFileEntry';
import {updateResource} from '@redux/thunks/updateResource';

import {AppDispatch} from '@shared/models/appDispatch';
import {K8sResource} from '@shared/models/k8sResource';

const debouncedCodeSave = debounce(
  (payload: {
    code: string;
    selectedResource: K8sResource | undefined;
    selectedPath: string | undefined;
    dispatch: AppDispatch;
  }) => {
    const {code, selectedResource, selectedPath, dispatch} = payload;

    // is a file and no resource selected?
    if (selectedPath && !selectedResource) {
      try {
        dispatch(updateFileEntry({path: selectedPath, text: code}));
        return true;
      } catch (e) {
        log.warn(`Failed to update file ${e}`, dispatch);
        return false;
      }
    } else if (selectedResource) {
      try {
        dispatch(updateResource({resourceIdentifier: selectedResource, text: code}));
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
  selectedResource: K8sResource | undefined,
  selectedPathRef: React.MutableRefObject<string | undefined>
) {
  const dispatch = useAppDispatch();
  const debouncedSaveContent = useCallback(
    (code: string) => {
      const success = debouncedCodeSave({
        code,
        selectedResource,
        selectedPath: selectedPathRef.current,
        dispatch,
      });
      if (success) {
        originalCodeRef.current = code;
      }
    },
    [selectedResource, selectedPathRef, dispatch, originalCodeRef]
  );

  return debouncedSaveContent;
}

export default useDebouncedCodeSave;
