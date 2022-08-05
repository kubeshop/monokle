import fs from 'fs';

import {AppDispatch} from '@models/appdispatch';
import {ShellsMapType, TerminalSettingsType} from '@models/terminal';

import {setShells, setTerminalSettings} from '@redux/reducers/terminal';

// get available shells for mac/linux
const detectAvailableUnixShells = (): ShellsMapType => {
  const contents = fs.readFileSync('/etc/shells', 'utf8');
  console.log(contents);

  return {bash: {name: 'Bash', shell: 'bash'}, zsh: {name: 'Zsh', shell: 'zsh'}};
};

export const setTerminalShells = (
  osPlatform: NodeJS.Platform,
  settings: TerminalSettingsType,
  dispatch: AppDispatch
) => {
  let shellsMap: ShellsMapType = {};

  if (osPlatform === 'win32') {
    shellsMap['powershell'] = {name: 'Powershell', shell: 'powershell.exe'};
    shellsMap['cmd'] = {name: 'Command Prompt', shell: 'cmd.exe'};
  } else {
    shellsMap = detectAvailableUnixShells();
  }

  if (!settings.defaultShell) {
    dispatch(setTerminalSettings({...settings, defaultShell: Object.keys(shellsMap)[0]}));
  }

  dispatch(setShells(shellsMap));

  return shellsMap;
};
