import {monaco} from 'react-monaco-editor';
import {useDebounce} from 'react-use';

import {ResourceMapType} from '@models/appstate';

import {useAppDispatch} from '@redux/hooks';
import {updateFileEntry, updateResource} from '@redux/reducers/main';
import {logMessage} from '@redux/services/log';

function useDebouncedCodeSave(
  editor: monaco.editor.IStandaloneCodeEditor | null,
  orgCode: string,
  code: string,
  isDirty: boolean,
  isValid: boolean,
  resourceMap: ResourceMapType,
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
        dispatch(updateFileEntry({path: selectedPath, content: value}));
        setOrgCode(value);
      } catch (e) {
        logMessage(`Failed to update file ${e}`, dispatch);
      }
    } else if (selectedResourceId && resourceMap[selectedResourceId]) {
      try {
        dispatch(updateResource({resourceId: selectedResourceId, content: value.toString()}));
        setOrgCode(value);
      } catch (e) {
        logMessage(`Failed to update resource ${e}`, dispatch);
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
    500,
    [code]
  );
}

export default useDebouncedCodeSave;
