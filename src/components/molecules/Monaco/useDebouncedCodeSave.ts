import {useRef} from 'react';
import {monaco} from 'react-monaco-editor';

import {debounce} from 'lodash';
import log from 'loglevel';

import {useAppDispatch} from '@redux/hooks';
import {updateFileEntry} from '@redux/thunks/updateFileEntry';
import {updateResource} from '@redux/thunks/updateResource';

import {ResourceMetaMap} from '@shared/models/k8sResource';

function useDebouncedCodeSave(
  editorRef: React.MutableRefObject<monaco.editor.IStandaloneCodeEditor | null>,
  originalCodeRef: React.MutableRefObject<string>,
  resourceMetaMapRef: React.MutableRefObject<ResourceMetaMap>,
  selectedResourceIdRef: React.MutableRefObject<string | undefined>,
  selectedPathRef: React.MutableRefObject<string | undefined>
) {
  const dispatch = useAppDispatch();
  const debouncedSaveContent = useRef(
    debounce((code: string) => {
      const resourceMeta = selectedResourceIdRef.current
        ? resourceMetaMapRef.current[selectedResourceIdRef.current]
        : undefined;

      // is a file and no resource selected?
      if (selectedPathRef.current && !resourceMeta) {
        try {
          dispatch(updateFileEntry({path: selectedPathRef.current, text: code}));

          originalCodeRef.current = code;
        } catch (e) {
          log.warn(`Failed to update file ${e}`, dispatch);
        }
      } else if (selectedResourceIdRef.current && resourceMeta) {
        try {
          dispatch(updateResource({resourceIdentifier: resourceMeta, text: code.toString()}));
          originalCodeRef.current = code;
        } catch (e) {
          log.warn(`Failed to update resource ${e}`, dispatch);
        }
      }
    }, 500)
  );

  return debouncedSaveContent;
}

export default useDebouncedCodeSave;
