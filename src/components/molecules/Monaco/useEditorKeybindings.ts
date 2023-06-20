import {useCallback, useEffect, useRef} from 'react';
import {monaco} from 'react-monaco-editor';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {openNewResourceWizard, openQuickSearchActionsPopup} from '@redux/reducers/ui';

import {restartEditorPreview} from '@utils/restartEditorPreview';

import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {FileMapType} from '@shared/models/appState';
import {isInClusterModeSelector, isInPreviewModeSelector} from '@shared/utils/selectors';

function useEditorKeybindings(
  editorRef: React.MutableRefObject<monaco.editor.IStandaloneCodeEditor | null>,
  hiddenInputRef: React.RefObject<HTMLInputElement>,
  fileMapRef: React.MutableRefObject<FileMapType>,
  applySelection: () => void,
  diffSelectedResource: () => void
) {
  const dispatch = useAppDispatch();
  const isQuickSearchActionsOpen = useAppSelector(state => state.ui.quickSearchActionsPopup.isOpen);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelector);
  const applySelectionDisposableRef = useRef<monaco.IDisposable | null>(null);
  const diffSelectedResourceDisposableRef = useRef<monaco.IDisposable | null>(null);

  useEffect(() => {
    if (editorRef.current) {
      applySelectionDisposableRef.current?.dispose();
      applySelectionDisposableRef.current = editorRef.current.addAction({
        id: 'monokle-apply-selection',
        label: 'Apply Selection',
        // eslint-disable-next-line no-bitwise
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt | monaco.KeyCode.KeyS],
        run: () => {
          applySelection();
        },
      });
    }
  }, [editorRef, applySelection]);

  useEffect(() => {
    if (editorRef.current) {
      diffSelectedResourceDisposableRef.current?.dispose();
      diffSelectedResourceDisposableRef.current = editorRef.current.addAction({
        id: 'monokle-diff-selected-resource',
        label: 'Diff Selected Resource',
        // eslint-disable-next-line no-bitwise
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt | monaco.KeyCode.KeyD],
        run: () => {
          diffSelectedResource();
        },
      });
    }
  }, [editorRef, diffSelectedResource]);

  const registerStaticActions = useCallback(
    (e: monaco.editor.IStandaloneCodeEditor) => {
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
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyN],
        run: () => {
          if (fileMapRef.current[ROOT_FILE_ENTRY] && !isInPreviewMode && !isInClusterMode) {
            dispatch(openNewResourceWizard());
          }
        },
      });

      e.addAction({
        id: 'monokle-reload-file-preview',
        label: 'Reload Preview',
        // eslint-disable-next-line no-bitwise
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyR],
        run: () => {
          restartEditorPreview();
        },
      });

      e.addAction({
        id: 'open-quick-search',
        label: 'Open Quick Search',
        // eslint-disable-next-line no-bitwise
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyP],
        run: () => {
          if (!isQuickSearchActionsOpen) {
            dispatch(openQuickSearchActionsPopup());
          }
        },
      });
    },
    [dispatch, fileMapRef, hiddenInputRef, isInClusterMode, isInPreviewMode, isQuickSearchActionsOpen]
  );

  return {registerStaticActions};
}

export default useEditorKeybindings;
