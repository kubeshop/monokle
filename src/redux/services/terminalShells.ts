import {detectDefaultShell} from 'default-shell';
import fs from 'fs';
import path from 'path';

import {SUPPORTED_SHELLS} from '@constants/terminal';

import {AppDispatch} from '@models/appdispatch';
import {ShellsMapType, TerminalSettingsType} from '@models/terminal';

import {setShells, setTerminalSettings} from '@redux/reducers/terminal';

// get available shells for mac/linux
const detectAvailableUnixShells = (osPlatform: NodeJS.Platform): ShellsMapType => {
  const getBasename = osPlatform === 'win32' ? path.win32.basename : path.basename;

  const contents = fs.readFileSync('/etc/shells', 'utf8');
  const shells = contents.split('\n').filter(e => e.trim().indexOf('#') !== 0 && e.trim().length > 0);

  let shellsMap: ShellsMapType = {};

  if (osPlatform === 'darwin') {
    shells.forEach(shellPath => {
      const shell = getBasename(shellPath);

      if (SUPPORTED_SHELLS['darwin'].includes(shell)) {
        shellsMap[shell] = {name: shell.charAt(0).toUpperCase() + shell.slice(1), shell};
      }
    });
  } else {
    shells.forEach(shellPath => {
      const shell = getBasename(shellPath);

      if (SUPPORTED_SHELLS['other'].includes(shell)) {
        shellsMap[shell] = {name: shell.charAt(0).toUpperCase() + shell.slice(1), shell};
      }
    });
  }

  return shellsMap;
};

export const setTerminalShells = (
  osPlatform: NodeJS.Platform,
  settings: TerminalSettingsType,
  dispatch: AppDispatch
) => {
  let shellsMap: ShellsMapType = {};

  if (osPlatform === 'win32') {
    shellsMap['powershell.exe'] = {name: 'Powershell', shell: 'powershell.exe'};
    shellsMap['cmd.exe'] = {name: 'Command Prompt', shell: 'cmd.exe'};
  } else {
    shellsMap = detectAvailableUnixShells(osPlatform);
  }

  if (!settings.defaultShell) {
    const getBasename = osPlatform === 'win32' ? path.win32.basename : path.basename;
    const defaultShellPath = detectDefaultShell();
    const defaultDetectedShell = getBasename(defaultShellPath);

    let defaultShell = '';

    if (osPlatform === 'win32' || osPlatform === 'darwin') {
      defaultShell = SUPPORTED_SHELLS[osPlatform].includes(defaultDetectedShell)
        ? defaultDetectedShell
        : SUPPORTED_SHELLS[osPlatform][0];
    } else {
      defaultShell = SUPPORTED_SHELLS['other'][0];
    }

    dispatch(setTerminalSettings({...settings, defaultShell}));
  }

  dispatch(setShells(shellsMap));

  return shellsMap;
};
