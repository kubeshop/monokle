import {BrowserWindow, Menu, MenuItemConstructorOptions} from 'electron';

import {ROOT_FILE_ENTRY} from '@constants/constants';
import hotkeys from '@constants/hotkeys';
import {ReloadFolderTooltip} from '@constants/tooltips';

import {NewVersionCode, Project} from '@models/appconfig';
import {RootState} from '@models/rootstate';

import {clearPreviewAndSelectionHistory, openResourceDiffModal, stopPreviewLoader} from '@redux/reducers/main';
import {
  openAboutModal,
  openCreateProjectModal,
  openFolderExplorer,
  openNewResourceWizard,
  resetLayout,
  setMonacoEditor,
  toggleLeftMenu,
  toggleStartProjectPane,
  zoomIn,
  zoomOut,
  openKeyboardShortcutsModal,
} from '@redux/reducers/ui';
import {isInPreviewModeSelector} from '@redux/selectors';
import {selectFromHistory} from '@redux/thunks/selectionHistory';
import {defineHotkey} from '@utils/defineHotkey';

import {openDiscord, openDocumentation, openGitHub} from '@utils/shell';

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
          dispatch(openAboutModal());
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
        accelerator: defineHotkey(hotkeys.OPEN_NEW_WINDOW),
        click() {
          openApplication();
        },
      },
      {type: 'separator'},
      {
        label: 'Refresh Folder',
        enabled: !isInPreviewModeSelector(state) && Boolean(state.main.fileMap[ROOT_FILE_ENTRY]),
        toolTip: ReloadFolderTooltip,
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
                dispatch(toggleStartProjectPane());
              }
            },
          },
          {type: 'separator'},
          {
            label: 'Select Folder',
            click: () => {
              dispatchToFocusedWindow(openFolderExplorer());
            },
          },
          {
            label: 'Empty Project',
            click: () => {
              dispatchToFocusedWindow(openCreateProjectModal({fromTemplate: false}));
            },
          },
          {
            label: 'From Template',
            click: () => {
              dispatchToFocusedWindow(openCreateProjectModal({fromTemplate: true}));
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
        click: async () => {
          dispatch(openNewResourceWizard());
        },
      },

      {type: 'separator'},
      {
        label: 'Exit Preview',
        enabled: isInPreviewModeSelector(state),
        click: () => {
          dispatch(stopPreviewLoader());
          dispatch(clearPreviewAndSelectionHistory());
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
  const isMonacoActionEnabled = Boolean(state.main.selectedResourceId) && state.ui.monacoEditor.focused;
  return {
    label: 'Edit',

    submenu: [
      {
        enabled: isMonacoActionEnabled,
        label: 'Undo',
        click: () => {
          dispatch(setMonacoEditor({undo: true}));
        },
      },
      {
        enabled: isMonacoActionEnabled,
        label: 'Redo',
        click: () => {
          dispatch(setMonacoEditor({redo: true}));
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
          dispatch(setMonacoEditor({find: true}));
        },
      },
      {
        enabled: isMonacoActionEnabled,
        label: 'Replace',
        click: () => {
          dispatch(setMonacoEditor({replace: true}));
        },
      },
      {type: 'separator'},
      {
        label: 'Apply',
        accelerator: hotkeys.APPLY_SELECTION,
        enabled: Boolean(state.main.selectedResourceId),
        click: () => {
          dispatch(setMonacoEditor({apply: true}));
        },
      },
      {
        label: 'Diff',
        accelerator: hotkeys.DIFF_RESOURCE,
        enabled: Boolean(state.main.selectedResourceId),
        click: () => {
          if (!state.main.selectedResourceId) {
            return;
          }
          dispatch(openResourceDiffModal(state.main.selectedResourceId));
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
        role: 'reload',
      },
      {
        label: 'Previous Resource',
        accelerator: hotkeys.SELECT_FROM_HISTORY_BACK,
        enabled: Boolean(isPreviousResourceEnabled),
        click: () => {
          selectFromHistory(
            'left',
            state.main.currentSelectionHistoryIndex,
            state.main.selectionHistory,
            state.main.resourceMap,
            state.main.fileMap,
            dispatch
          );
        },
      },
      {
        label: 'Next Resource',
        accelerator: hotkeys.SELECT_FROM_HISTORY_FORWARD,
        enabled: Boolean(isNextResourceEnabled),
        click: () => {
          selectFromHistory(
            'right',
            state.main.currentSelectionHistoryIndex,
            state.main.selectionHistory,
            state.main.resourceMap,
            state.main.fileMap,
            dispatch
          );
        },
      },
      {type: 'separator'},
      {
        label: 'Toggle Left Menu',
        accelerator: defineHotkey(hotkeys.TOGGLE_LEFT_PANE),
        click: () => {
          dispatch(toggleLeftMenu());
        },
      },
      {role: 'toggleDevTools'},
      {
        label: 'Reset Layout',
        click: () => {
          dispatch(resetLayout());
        },
      },
      {type: 'separator'},
      {role: 'togglefullscreen'},
      {type: 'separator'},
      {
        label: 'Zoom in',
        accelerator: defineHotkey(hotkeys.ZOOM_IN),
        click: () => {
          dispatch(zoomIn());
        },
      },
      {
        label: 'Zoom out',
        accelerator: defineHotkey(hotkeys.ZOOM_OUT),
        click: () => {
          dispatch(zoomOut());
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
      accelerator: defineHotkey(hotkeys.OPEN_SHORTCUTS),
      label: 'Keyboard Shortcuts',
      click: () => dispatch(openKeyboardShortcutsModal()),
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
