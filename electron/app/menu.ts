import {BrowserWindow, Menu, MenuItemConstructorOptions} from 'electron';

import {ROOT_FILE_ENTRY} from '@monokle-desktop/shared/constants/fileEntry';
import {hotkeys} from '@monokle-desktop/shared/constants/hotkeys';
import {NewVersionCode, Project, RootState} from '@monokle-desktop/shared/models';
import {defineHotkey} from '@monokle-desktop/shared/utils/hotkey';
import {selectFromHistory} from '@monokle-desktop/shared/utils/selectionHistory';
import {isInPreviewModeSelector, kubeConfigPathValidSelector} from '@monokle-desktop/shared/utils/selectors';
import {openDiscord, openDocumentation, openGitHub, openLogs} from '@monokle-desktop/shared/utils/shell';

import {checkNewVersion} from './commands';
import {MainDispatch, dispatchToFocusedWindow} from './ipc/ipcMainRedux';
import {openApplication} from './openApplication';

const isMac = process.platform === 'darwin';

const getUpdateMonokleText = (newVersion: {code: NewVersionCode; data: any}) => {
  if (newVersion.code > NewVersionCode.Checking) {
    if (newVersion.code === NewVersionCode.Downloading) {
      return `Downloading.. %${newVersion.data?.percent}`;
    }
    if (newVersion.code === NewVersionCode.Downloaded) {
      return 'Update Monokle';
    }
  }
  return 'Check for Update';
};

const checkForUpdateMenu = (state: RootState, dispatch: MainDispatch) => {
  return {
    label: getUpdateMonokleText(state.config.newVersion),
    enabled: state.config.newVersion.code !== NewVersionCode.Downloading,
    click: async () => {
      await checkNewVersion(dispatch);
    },
  };
};

const appMenu = (state: RootState, dispatch: MainDispatch): MenuItemConstructorOptions => {
  return {
    label: `Monokle${state.config.newVersion.code > NewVersionCode.Checking ? ' ⬆️' : ''}`,
    submenu: [
      {
        label: 'About Monokle',
        click: () => {
          dispatch({type: 'ui/openAboutModal', payload: undefined});
        },
      },
      checkForUpdateMenu(state, dispatch),
      {type: 'separator'},
      {label: 'Hide Monokle', role: 'hide'},
      {role: 'hideOthers'},
      {role: 'unhide'},
      {type: 'separator'},
      {label: 'Quit Monokle', role: 'quit'},
    ],
  };
};

// need this because we cannot dispatch thunks from main
function setRootFolderInRendererThread(folder: string) {
  const window = BrowserWindow.getFocusedWindow();
  if (window) {
    window.webContents.send('set-root-folder', folder);
  }
}

// need this because we cannot dispatch thunks from main
function openProjectInRendererThread(project: Project) {
  const window = BrowserWindow.getFocusedWindow();
  if (window) {
    window.webContents.send('open-project', project);
  }
}

const fileMenu = (state: RootState, dispatch: MainDispatch): MenuItemConstructorOptions => {
  return {
    label: 'File',
    submenu: [
      {
        label: 'New Monokle Window',
        accelerator: defineHotkey(hotkeys.OPEN_NEW_WINDOW.key),
        click() {
          openApplication();
        },
      },
      {type: 'separator'},
      {
        label: 'Refresh Folder',
        accelerator: defineHotkey(hotkeys.REFRESH_FOLDER.key),
        enabled: !isInPreviewModeSelector(state) && Boolean(state.main.fileMap[ROOT_FILE_ENTRY]),
        click: () => {
          setRootFolderInRendererThread(state.main.fileMap[ROOT_FILE_ENTRY].filePath);
        },
      },
      {type: 'separator'},
      {
        label: 'New Project',
        submenu: [
          {
            label: 'Getting Started Page',
            click: () => {
              if (!state.ui.isStartProjectPaneVisible) {
                dispatch({type: 'ui/toggleStartProjectPane', payload: undefined});
              }
            },
          },
          {type: 'separator'},
          {
            label: 'Select Folder',
            click: () => {
              dispatchToFocusedWindow({type: 'ui/openFolderExplorer', payload: undefined});
            },
          },
          {
            label: 'Empty Project',
            click: () => {
              dispatchToFocusedWindow({type: 'ui/openCreateProjectModal', payload: {fromTemplate: false}});
            },
          },
          {
            label: 'From Template',
            click: () => {
              dispatchToFocusedWindow({type: 'ui/openCreateProjectModal', payload: {fromTemplate: true}});
            },
          },
        ],
      },
      {
        label: 'Recent Projects',
        submenu: state.config.projects.map((project: Project) => ({
          label: `${project.name} - ${project.rootFolder}`,
          click: () => {
            openProjectInRendererThread(project);
          },
        })),
      },
      {type: 'separator'},
      {
        label: 'New Resource',
        enabled: Boolean(state.main.fileMap[ROOT_FILE_ENTRY]),
        click: () => {
          dispatch({type: 'ui/openNewResourceWizard', payload: undefined});
        },
      },

      {type: 'separator'},
      {
        label: 'Exit Preview',
        enabled: isInPreviewModeSelector(state),
        click: () => {
          dispatch({type: 'main/stopPreviewLoader', payload: undefined});
          dispatch({type: 'main/clearPreviewAndSelectionHistory', payload: undefined});
        },
      },
      {type: 'separator'},
      {
        label: 'Close Window',
        click: () => {
          const window = BrowserWindow.getFocusedWindow();
          if (window) {
            window.close();
          }
        },
      },
    ],
  };
};

const editMenu = (state: RootState, dispatch: MainDispatch): MenuItemConstructorOptions => {
  const isKubeConfigPathValid = kubeConfigPathValidSelector(state);
  const isMonacoActionEnabled = Boolean(state.main.selectedResourceId) && state.ui.monacoEditor.focused;
  return {
    label: 'Edit',

    submenu: [
      {
        enabled: isMonacoActionEnabled,
        label: 'Undo',
        click: () => {
          dispatch({type: 'ui/setMonacoEditor', payload: {undo: true}});
        },
      },
      {
        enabled: isMonacoActionEnabled,
        label: 'Redo',
        click: () => {
          dispatch({type: 'ui/setMonacoEditor', payload: {redo: true}});
        },
      },
      {type: 'separator'},
      {role: 'copy'},
      {role: 'cut'},
      {role: 'paste'},
      {role: 'selectAll'},
      {type: 'separator'},
      {
        enabled: isMonacoActionEnabled,
        label: 'Find',
        click: () => {
          dispatch({type: 'ui/setMonacoEditor', payload: {find: true}});
        },
      },
      {
        enabled: isMonacoActionEnabled,
        label: 'Replace',
        click: () => {
          dispatch({type: 'ui/setMonacoEditor', payload: {replace: true}});
        },
      },
      {type: 'separator'},
      {
        label: 'Apply',
        accelerator: hotkeys.APPLY_SELECTION.key,
        enabled: Boolean(state.main.selectedResourceId) && Boolean(isKubeConfigPathValid),
        click: () => {
          dispatch({type: 'ui/setMonacoEditor', payload: {apply: true}});
        },
      },
      {
        label: 'Diff',
        accelerator: hotkeys.DIFF_RESOURCE.key,
        enabled: Boolean(state.main.selectedResourceId) && Boolean(isKubeConfigPathValid),
        click: () => {
          if (!state.main.selectedResourceId) {
            return;
          }
          dispatch({type: 'main/openResourceDiffModal', payload: state.main.selectedResourceId});
        },
      },
    ],
  };
};

const viewMenu = (state: RootState, dispatch: MainDispatch): MenuItemConstructorOptions => {
  const isPreviousResourceEnabled =
    state.main.selectionHistory.length > 1 &&
    (state.main.currentSelectionHistoryIndex === undefined ||
      (state.main.currentSelectionHistoryIndex && state.main.currentSelectionHistoryIndex > 0));
  const isNextResourceEnabled =
    state.main.selectionHistory.length > 1 &&
    state.main.currentSelectionHistoryIndex !== undefined &&
    state.main.currentSelectionHistoryIndex < state.main.selectionHistory.length - 1;

  return {
    label: 'View',
    submenu: [
      {
        role: 'forceReload',
      },
      {
        label: 'Previous Resource',
        accelerator: hotkeys.SELECT_FROM_HISTORY_BACK.key,
        enabled: Boolean(isPreviousResourceEnabled),
        click: () => {
          selectFromHistory(
            'left',
            state.main.currentSelectionHistoryIndex,
            state.main.selectionHistory,
            state.main.resourceMap,
            state.main.fileMap,
            state.main.imagesList,
            dispatch
          );
        },
      },
      {
        label: 'Next Resource',
        accelerator: hotkeys.SELECT_FROM_HISTORY_FORWARD.key,
        enabled: Boolean(isNextResourceEnabled),
        click: () => {
          selectFromHistory(
            'right',
            state.main.currentSelectionHistoryIndex,
            state.main.selectionHistory,
            state.main.resourceMap,
            state.main.fileMap,
            state.main.imagesList,
            dispatch
          );
        },
      },
      {type: 'separator'},
      {
        label: 'Toggle Left Menu',
        accelerator: defineHotkey(hotkeys.TOGGLE_LEFT_PANE.key),
        click: () => {
          dispatch({type: 'ui/toggleLeftMenu', payload: undefined});
        },
      },
      {role: 'toggleDevTools'},
      {
        label: 'Reset Layout',
        click: () => {
          dispatch({type: 'ui/resetLayout', payload: undefined});
        },
      },
      {type: 'separator'},
      {role: 'togglefullscreen'},
      {type: 'separator'},
      {
        label: 'Zoom in',
        accelerator: defineHotkey(hotkeys.ZOOM_IN.key),
        click: () => {
          dispatch({type: 'ui/zoomIn', payload: undefined});
        },
      },
      {
        label: 'Zoom out',
        accelerator: defineHotkey(hotkeys.ZOOM_OUT.key),
        click: () => {
          dispatch({type: 'ui/zoomOut', payload: undefined});
        },
      },
    ],
  };
};

const windowMenu = (): MenuItemConstructorOptions => {
  const submenu: MenuItemConstructorOptions[] = [
    {role: 'minimize'},
    {type: 'separator'},
    {role: 'front'},
    {type: 'separator'},
    {role: 'window'},
  ];

  if (isMac) {
    submenu.splice(1, 0, {role: 'zoom'});
  }

  return {label: 'Window', submenu};
};

const helpMenu = (
  state: RootState,
  dispatch: MainDispatch,
  includeUpdateMenu?: boolean
): MenuItemConstructorOptions => {
  const submenu: any = [
    {
      label: 'Documentation',
      click: openDocumentation,
    },
    {
      accelerator: defineHotkey(hotkeys.OPEN_SHORTCUTS.key),
      label: 'Keyboard Shortcuts',
      click: () => dispatch({type: 'ui/openKeyboardShortcutsModal', payload: undefined}),
    },
    {
      label: 'Logs',
      click: openLogs,
    },
    {type: 'separator'},
    {
      label: 'GitHub',
      click: openGitHub,
    },
    {type: 'separator'},
    {
      label: 'Discord',
      click: openDiscord,
    },
  ];

  if (includeUpdateMenu) {
    submenu.push({type: 'separator'});
    submenu.push(checkForUpdateMenu(state, dispatch));
  }
  return {
    label: 'Help',
    submenu,
  };
};

export const createMenu = (state: RootState, dispatch: MainDispatch) => {
  const template: MenuItemConstructorOptions[] = [
    fileMenu(state, dispatch),
    editMenu(state, dispatch),
    viewMenu(state, dispatch),
    windowMenu(),
    helpMenu(state, dispatch, !isMac),
  ];

  if (isMac) {
    template.unshift(appMenu(state, dispatch));
  }
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
};

export const getDockMenu = () => {
  return Menu.buildFromTemplate([
    {
      label: 'New Window',
      click() {
        openApplication();
      },
    },
  ]);
};
