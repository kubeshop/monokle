import {BrowserWindow, Menu, MenuItemConstructorOptions, shell} from 'electron';
import hotkeys from '@constants/hotkeys';

const isMac = process.platform === 'darwin';

const appMenu = (win: BrowserWindow): MenuItemConstructorOptions => {
  return {
    label: 'Monokle',
    submenu: [
      {
        label: 'About Monokle',
        click: async () => {
          win.webContents.send('show-launch-dialog');
        },
      },
      {
        label: 'Check for Update',
        click: async () => {
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

const fileMenu = (win: BrowserWindow): MenuItemConstructorOptions => {
  return {
    label: 'File',
    submenu: [
      {
        label: 'Browse Folder',
        click: async () => {
          console.log('Browse folder');
        },
      },
      {
        label: 'Refresh Folder',
        click: async () => {
          console.log('Refresh folder');
        },
      },
      {type: 'separator'},
      {
        label: 'Recent Folders',
        click: async () => {
          console.log('Refresh folder');
        },
      },
      {type: 'separator'},
      {
        label: 'New Resource',
        click: async () => {
          console.log('Refresh folder');
        },
      },
      {type: 'separator'},
      {label: 'Exit Preview'},
    ],
  };
};

const editMenu = (win: BrowserWindow): MenuItemConstructorOptions => {
  return {
    label: 'Edit',
    submenu: [
      {role: 'undo'},
      {role: 'redo'},
      {type: 'separator'},
      {role: 'cut'},
      {role: 'copy'},
      {role: 'paste'},
      {type: 'separator'},
      {label: 'Find'},
      {label: 'Replace'},
      {type: 'separator'},
      {label: 'Apply'},
      {label: 'Diff'},
    ],
  };
};

const viewMenu = (win: BrowserWindow): MenuItemConstructorOptions => {
  return {
    label: 'View',
    submenu: [
      {
        label: 'Previous Resource',
        accelerator: hotkeys.SELECT_FROM_HISTORY_BACK,
        click: () => {
          win.webContents.send('select-from-history', {direction: 'left'});
        },
      },
      {
        label: 'Next Resource',
        accelerator: hotkeys.SELECT_FROM_HISTORY_FORWARD,
        click: () => {
          win.webContents.send('select-from-history', {direction: 'right'});
        },
      },
      {type: 'separator'},
      {label: 'Toggle Navigator'},
      {type: 'separator'},
    ],
  };
};

const windowMenu = (win: BrowserWindow): MenuItemConstructorOptions => {
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

const helpMenu = (win: BrowserWindow): MenuItemConstructorOptions => {
  return {
    label: 'Help',
    submenu: [
      {
        label: 'Documentation',
        click: async () => {
          await shell.openExternal('https://kubeshop.github.io/monokle/');
        },
      },
      {type: 'separator'},
      {
        label: 'Github',
        click: async () => {
          await shell.openExternal('https://github.com/kubeshop/monokle');
        },
      },
    ],
  };
};

export const createMenu = (win: BrowserWindow) => {
  const template: any[] = [fileMenu(win), editMenu(win), viewMenu(win), windowMenu(win), helpMenu(win)];

  if (isMac) {
    template.unshift(appMenu(win));
  }
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
};
