import {Menu, MenuItemConstructorOptions} from 'electron';
import hotkeys from '@constants/hotkeys';
import {updateStartupModalVisible} from '@redux/reducers/appConfig';
import {AppState} from '@models/appstate';
import {AppConfig} from '@models/appconfig';
import {ROOT_FILE_ENTRY} from '@constants/constants';
import {BrowseFolderTooltip, ReloadFolderTooltip} from '@constants/tooltips';
import {clearPreviewAndSelectionHistory, stopPreviewLoader} from '@redux/reducers/main';
import {
  openFolderExplorer,
  openNewResourceWizard,
  setMonacoEditor,
  setShouldExpandAllNodes,
  toggleLeftMenu,
  resetLayout,
} from '@redux/reducers/ui';
import {UiState} from '@models/ui';
import {openGitHub, openDocumentation} from '@utils/shell';
import {isInPreviewModeSelector} from '@redux/selectors';
import {createWindow} from './main';

const isMac = process.platform === 'darwin';

const appMenu = (store: any): MenuItemConstructorOptions => {
  return {
    label: 'Monokle',
    submenu: [
      {
        label: 'About Monokle',
        click: async () => {
          await store.dispatch(updateStartupModalVisible(true));
        },
      },
      {
        label: 'Check for Update',
        enabled: false,
        click: () => {
          console.log('Check for update');
        },
      },
      {type: 'separator'},
      {label: 'Hide Monokle', role: 'hide'},
      {role: 'hideOthers'},
      {role: 'unhide'},
      {type: 'separator'},
      {label: 'Quit Monokle', role: 'quit'},
    ],
  };
};

const fileMenu = (store: any): MenuItemConstructorOptions => {
  const configState: AppConfig = store.getState().config;
  const mainState: AppState = store.getState().main;
  return {
    label: 'File',
    submenu: [
      {
        label: 'Browse Folder',
        toolTip: BrowseFolderTooltip,
        enabled: !isInPreviewModeSelector(store.getState()),
        click: async () => {
          store.dispatch(openFolderExplorer());
        },
      },
      {
        label: 'Refresh Folder',
        enabled: !isInPreviewModeSelector(store.getState()) && Boolean(mainState.fileMap[ROOT_FILE_ENTRY]),
        toolTip: ReloadFolderTooltip,
        click: async () => {
          const {setRootFolder} = await import('@redux/thunks/setRootFolder'); // Temporary fix until refactor
          store.dispatch(setRootFolder(mainState.fileMap[ROOT_FILE_ENTRY].filePath));
        },
      },
      {type: 'separator'},
      {
        label: 'Recent Folders',
        submenu: configState.recentFolders.map((folder: string) => ({
          label: folder,
          click: async () => {
            const {setRootFolder} = await import('@redux/thunks/setRootFolder'); // Temporary fix until refactor
            store.dispatch(setRootFolder(folder));
            store.dispatch(setShouldExpandAllNodes(true));
          },
        })),
      },
      {type: 'separator'},
      {
        label: 'New Resource',
        enabled: Boolean(mainState.fileMap[ROOT_FILE_ENTRY]),
        click: async () => {
          store.dispatch(openNewResourceWizard());
        },
      },
      {type: 'separator'},
      {
        label: 'Exit Preview',
        enabled: isInPreviewModeSelector(store.getState()),
        click: () => {
          store.dispatch(stopPreviewLoader());
          store.dispatch(clearPreviewAndSelectionHistory());
        },
      },
    ],
  };
};

const editMenu = (store: any): MenuItemConstructorOptions => {
  const mainState: AppState = store.getState().main;
  const uiState: UiState = store.getState().ui;
  return {
    label: 'Edit',
    enabled: Boolean(mainState.selectedResourceId) && uiState.monacoEditor.focused,
    submenu: [
      {
        label: 'Undo',
        click: () => {
          store.dispatch(setMonacoEditor({undo: true}));
        },
      },
      {
        label: 'Redo',
        click: () => {
          store.dispatch(setMonacoEditor({redo: true}));
        },
      },
      {type: 'separator'},
      {role: 'cut'},
      {role: 'copy'},
      {role: 'paste'},
      {type: 'separator'},
      {
        label: 'Find',
        click: () => {
          store.dispatch(setMonacoEditor({find: true}));
        },
      },
      {
        label: 'Replace',
        click: () => {
          store.dispatch(setMonacoEditor({replace: true}));
        },
      },
      {type: 'separator'},
      {
        label: 'Apply',
        accelerator: hotkeys.APPLY_SELECTION,
        click: () => {
          store.dispatch(setMonacoEditor({apply: true}));
        },
      },
      {
        label: 'Diff',
        accelerator: hotkeys.DIFF_RESOURCE,
        click: async () => {
          const {performResourceDiff} = await import('@redux/thunks/diffResource');
          store.dispatch(performResourceDiff(<string>mainState.selectedResourceId));
        },
      },
    ],
  };
};

const viewMenu = (store: any): MenuItemConstructorOptions => {
  let mainState: AppState = store.getState().main;
  const isPreviousResourceEnabled =
    mainState.selectionHistory.length > 1 &&
    (mainState.currentSelectionHistoryIndex === undefined ||
      (mainState.currentSelectionHistoryIndex && mainState.currentSelectionHistoryIndex > 0));
  const isNextResourceEnabled =
    mainState.selectionHistory.length > 1 &&
    mainState.currentSelectionHistoryIndex !== undefined &&
    mainState.currentSelectionHistoryIndex < mainState.selectionHistory.length - 1;

  return {
    label: 'View',
    submenu: [
      {
        role: 'reload',
      },
      {
        label: 'Previous Resource',
        accelerator: hotkeys.SELECT_FROM_HISTORY_BACK,
        enabled: Boolean(isPreviousResourceEnabled),
        click: async () => {
          const {selectFromHistory} = await import('@redux/thunks/selectionHistory'); // Temporary fix until refactor
          store.dispatch(selectFromHistory({direction: 'left'}));
        },
      },
      {
        label: 'Next Resource',
        accelerator: hotkeys.SELECT_FROM_HISTORY_FORWARD,
        enabled: Boolean(isNextResourceEnabled),
        click: async () => {
          const {selectFromHistory} = await import('@redux/thunks/selectionHistory'); // Temporary fix until refactor
          store.dispatch(selectFromHistory({direction: 'right'}));
        },
      },
      {type: 'separator'},
      {
        label: 'Toggle Left Menu',
        accelerator: hotkeys.TOGGLE_LEFT_PANE,
        click: () => {
          store.dispatch(toggleLeftMenu());
        },
      },
      {
        label: 'Reset Layout',
        click: () => {
          store.dispatch(resetLayout());
        },
      },
      {type: 'separator'},
      {role: 'togglefullscreen'},
    ],
  };
};

const windowMenu = (store: any): MenuItemConstructorOptions => {
  return {
    label: 'Window',
    submenu: [
      {role: 'minimize'},
      {role: 'zoom'},
      {type: 'separator'},
      {role: 'front'},
      {type: 'separator'},
      {role: 'window'},
    ],
  };
};

const helpMenu = (store: any): MenuItemConstructorOptions => {
  return {
    label: 'Help',
    submenu: [
      {
        label: 'Documentation',
        click: openDocumentation,
      },
      {type: 'separator'},
      {
        label: 'GitHub',
        click: openGitHub,
      },
    ],
  };
};

export const createMenu = (store: any) => {
  const template: any[] = [fileMenu(store), editMenu(store), viewMenu(store), windowMenu(store), helpMenu(store)];

  if (isMac) {
    template.unshift(appMenu(store));
  }
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
};

export const getDockMenu = (store: any) => {
  return Menu.buildFromTemplate([
    {
      label: 'New Window',
      click() {
        createWindow();
      },
    },
  ]);
};
