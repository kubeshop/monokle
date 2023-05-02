import {BrowserWindow, Menu, MenuItemConstructorOptions, app} from 'electron';

import {hotkeys} from '@shared/constants/hotkeys';
import {NewVersionCode, Project} from '@shared/models/config';
import type {ElectronMenuDataType} from '@shared/models/rootState';
import {defineHotkey} from '@shared/utils/hotkey';
import {isInClusterModeSelector, isInPreviewModeSelector} from '@shared/utils/selectors';
import {openDiscord, openDocumentation, openGitHub, openLogs} from '@shared/utils/shell';

import {checkNewVersion} from './commands';
import {MainDispatch, dispatchToFocusedWindow} from './ipc/ipcMainRedux';
import {openApplication} from './openApplication';

const isMac = process.platform === 'darwin';

export const menuStatePropertiesToPick = [
  'config.projects',
  'config.selectedProjectRootFolder',
  'config.newVersion',
  'config.projectConfig',
  'config.kubeConfig',

  'cluster.kubeconfigs',

  'ui.isStartProjectPaneVisible',
  'ui.isInQuickClusterMode',
  'ui.isStartProjectPaneVisible',
  'ui.monacoEditor',

  'main.selection',
  'main.preview',
  'main.clusterConnection',
];

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

const createAppUpdateMenuItem = (state: ElectronMenuDataType, dispatch: MainDispatch) => {
  return {
    label: getUpdateMonokleText(state?.config?.newVersion),
    enabled: state?.config?.newVersion?.code !== NewVersionCode.Downloading,
    click: async () => {
      await checkNewVersion(dispatch);
    },
  };
};

const createAppMenu = (state: ElectronMenuDataType, dispatch: MainDispatch): MenuItemConstructorOptions => {
  return {
    label: `Monokle${state?.config?.newVersion?.code > NewVersionCode.Checking ? ' ⬆️' : ''}`,
    submenu: [
      {
        label: 'About Monokle',
        click: () => {
          dispatch({type: 'ui/openAboutModal', payload: undefined});
        },
      },
      createAppUpdateMenuItem(state, dispatch),
      {label: `Version: ${app.getVersion()}`},
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

const fileMenu = (state: ElectronMenuDataType, dispatch: MainDispatch): MenuItemConstructorOptions => {
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
        enabled: !isInPreviewModeSelector(state) && Boolean(state?.config?.selectedProjectRootFolder),
        click: () => {
          if (state?.config?.selectedProjectRootFolder) {
            setRootFolderInRendererThread(state?.config?.selectedProjectRootFolder);
          }
        },
      },
      {type: 'separator'},
      {
        label: 'New Project',
        submenu: [
          {
            label: 'Tutorial Page',
            click: () => {
              if (!state?.ui?.isStartProjectPaneVisible) {
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
        submenu: state?.config?.projects.map((project: Project) => ({
          label: `${project.name} - ${project.rootFolder}`,
          click: () => {
            openProjectInRendererThread(project);
          },
        })),
      },
      {type: 'separator'},
      {
        label: 'New Resource',
        enabled:
          Boolean(state?.config?.selectedProjectRootFolder) &&
          !isInPreviewModeSelector(state) &&
          !isInClusterModeSelector(state as any),
        click: () => {
          dispatch({type: 'ui/openNewResourceWizard', payload: undefined});
        },
      },

      {type: 'separator'},
      {
        label: 'Exit Preview',
        enabled: isInPreviewModeSelector(state),
        click: () => {
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

const editMenu = (state: ElectronMenuDataType, dispatch: MainDispatch): MenuItemConstructorOptions => {
  const isMonacoActionEnabled =
    Boolean(state?.main?.selection?.type === 'resource' || state?.main?.selection?.type === 'file') &&
    state?.ui?.monacoEditor?.focused;
  return {
    label: 'Edit',

    submenu: [
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
    ],
  };
};

const viewMenu = (state: ElectronMenuDataType, dispatch: MainDispatch): MenuItemConstructorOptions => {
  return {
    label: 'View',
    submenu: [
      {
        role: 'forceReload',
      },
      {type: 'separator'},
      {
        label: 'Toggle Left Menu',
        accelerator: defineHotkey(hotkeys.TOGGLE_LEFT_PANE.key),
        click: () => {
          if (!state.ui.isInQuickClusterMode) {
            dispatch({type: 'ui/toggleLeftMenu', payload: undefined});
          }
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
  state: ElectronMenuDataType,
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
    submenu.push(createAppUpdateMenuItem(state, dispatch));
  }
  return {
    label: 'Help',
    submenu,
  };
};

export const createMenu = (state: ElectronMenuDataType, dispatch: MainDispatch) => {
  const template: MenuItemConstructorOptions[] = [
    fileMenu(state, dispatch),
    editMenu(state, dispatch),
    viewMenu(state, dispatch),
    windowMenu(),
    helpMenu(state, dispatch, !isMac),
  ];

  if (isMac) {
    template.unshift(createAppMenu(state, dispatch));
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
