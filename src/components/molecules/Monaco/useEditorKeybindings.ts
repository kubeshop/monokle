import {ROOT_FILE_ENTRY} from '@constants/constants';
import {FileMapType} from '@models/appstate';
import {useAppDispatch} from '@redux/hooks';
import {openNewResourceWizard} from '@redux/reducers/ui';
import {selectFromHistory} from '@redux/thunks/selectionHistory';
import {useEffect, useRef} from 'react';
import {monaco} from 'react-monaco-editor';

function useEditorKeybindings(
  editor: monaco.editor.IStandaloneCodeEditor | null,
  hiddenInputRef: React.RefObject<HTMLInputElement>,
  fileMap: FileMapType,
  applySelection: () => void,
  diffSelectedResource: () => void
) {
  const dispatch = useAppDispatch();
  const applySelectionDisposableRef = useRef<monaco.IDisposable | null>(null);
  const diffSelectedResourceDisposableRef = useRef<monaco.IDisposable | null>(null);

  useEffect(() => {
    if (editor) {
      applySelectionDisposableRef.current?.dispose();
      applySelectionDisposableRef.current = editor.addAction({
        id: 'monokle-apply-selection',
        label: 'Apply Selection',
        // eslint-disable-next-line no-bitwise
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt | monaco.KeyCode.KEY_S],
        run: () => {
          applySelection();
        },
      });
    }
  }, [editor, applySelection]);

  useEffect(() => {
    if (editor) {
      diffSelectedResourceDisposableRef.current?.dispose();
      diffSelectedResourceDisposableRef.current = editor.addAction({
        id: 'monokle-diff-selected-resource',
        label: 'Diff Selected Resource',
        // eslint-disable-next-line no-bitwise
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt | monaco.KeyCode.KEY_D],
        run: () => {
          diffSelectedResource();
        },
      });
    }
  }, [editor, diffSelectedResource]);

  const registerStaticActions = (e: monaco.editor.IStandaloneCodeEditor) => {
    // register action to exit editor focus
    e.addAction({
      id: 'monokle-exit-editor-focus',
      label: 'Exit Editor Focus',
      // eslint-disable-next-line no-bitwise
      keybindings: [monaco.KeyCode.Escape],
      run: () => {
        hiddenInputRef.current?.focus();
      },
    });

    // register action to navigate back in the selection history
    e.addAction({
      id: 'monokle-navigate-back',
      label: 'Navigate Back',
      // eslint-disable-next-line no-bitwise
      keybindings: [monaco.KeyMod.Alt | monaco.KeyCode.LeftArrow],
      run: () => {
        dispatch(selectFromHistory({direction: 'left'}));
      },
    });

    // register action to navigate forward in the selection history
    e.addAction({
      id: 'monokle-navigate-forward',
      label: 'Navigate Forward',
      // eslint-disable-next-line no-bitwise
      keybindings: [monaco.KeyMod.Alt | monaco.KeyCode.RightArrow],
      run: () => {
        dispatch(selectFromHistory({direction: 'right'}));
      },
    });

    e.addAction({
      id: 'monokle-open-new-resource-wizard',
      label: 'Open New Resource Wizard',
      // eslint-disable-next-line no-bitwise
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_N],
      run: () => {
        if (fileMap[ROOT_FILE_ENTRY]) {
          dispatch(openNewResourceWizard());
        }
      },
    });
  };

  return {registerStaticActions};
}

export default useEditorKeybindings;
