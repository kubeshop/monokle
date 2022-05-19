import {useEffect, useRef} from 'react';
import {monaco} from 'react-monaco-editor';

import {ROOT_FILE_ENTRY} from '@constants/constants';

import {FileMapType} from '@models/appstate';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {openNewResourceWizard, openQuickSearchActionsPopup} from '@redux/reducers/ui';

import {restartEditorPreview} from '@utils/restartEditorPreview';

function useEditorKeybindings(
  editor: monaco.editor.IStandaloneCodeEditor | null,
  hiddenInputRef: React.RefObject<HTMLInputElement>,
  fileMap: FileMapType,
  applySelection: () => void,
  diffSelectedResource: () => void
) {
  const dispatch = useAppDispatch();
  const uiState = useAppSelector(state => state.ui);
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

    e.addAction({
      id: 'monokle-reload-file-preview',
      label: 'Reload Preview',
      // eslint-disable-next-line no-bitwise
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KEY_R],
      run: () => {
        restartEditorPreview();
      },
    });

    e.addAction({
      id: 'open-quick-search',
      label: 'Open Quick Search',
      // eslint-disable-next-line no-bitwise
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_P],
      run: () => {
        if (!uiState.quickSearchActionsPopup.isOpen) {
          dispatch(openQuickSearchActionsPopup());
        }
      },
    });
  };

  return {registerStaticActions};
}

export default useEditorKeybindings;
