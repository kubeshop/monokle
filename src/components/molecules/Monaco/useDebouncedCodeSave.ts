import {monaco} from 'react-monaco-editor';
import {useDebounce} from 'react-use';

import log from 'loglevel';

import {DEFAULT_EDITOR_DEBOUNCE} from '@constants/constants';

import {useAppDispatch} from '@redux/hooks';
import {updateFileEntry} from '@redux/thunks/updateFileEntry';
import {updateResource} from '@redux/thunks/updateResource';

import {ResourceMetaMap} from '@shared/models/k8sResource';

function useDebouncedCodeSave(
  editor: monaco.editor.IStandaloneCodeEditor | null,
  orgCode: string,
  code: string,
  isDirty: boolean,
  isValid: boolean,
  resourceMetaMap: ResourceMetaMap,
  selectedResourceId: string | undefined,
  selectedPath: string | undefined,
  setOrgCode: (newOrgCode: string) => void
) {
  const dispatch = useAppDispatch();
  const saveContent = () => {
    let value = null;
    if (editor) {
      value = editor.getValue();
    } else {
      return;
    }

    // is a file and no resource selected?
    if (selectedPath && !selectedResourceId) {
      try {
        dispatch(updateFileEntry({path: selectedPath, text: value}));

        setOrgCode(value);
      } catch (e) {
        log.warn(`Failed to update file ${e}`, dispatch);
      }
    } else if (selectedResourceId && resourceMetaMap[selectedResourceId]) {
      try {
        dispatch(updateResource({resourceId: selectedResourceId, text: value.toString()}));
        setOrgCode(value);
      } catch (e) {
        log.warn(`Failed to update resource ${e}`, dispatch);
      }
    }
  };

  useDebounce(
    () => {
      if (!isDirty || !isValid) {
        return;
      }
      if (orgCode !== undefined && code !== undefined && orgCode !== code) {
        saveContent();
      }
    },
    DEFAULT_EDITOR_DEBOUNCE,
    [code]
  );
}

export default useDebouncedCodeSave;
