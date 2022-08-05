import fs from 'fs';

import {AppDispatch} from '@models/appdispatch';
import {ShellsMapType, TerminalSettingsType} from '@models/terminal';

import {setShells, setTerminalSettings} from '@redux/reducers/terminal';

// get available shells for mac/linux
const detectAvailableUnixShells = (): ShellsMapType => {
  const contents = fs.readFileSync('/etc/shells', 'utf8');
  console.log(contents);

  return {bash: {name: 'Bash'}, zsh: {name: 'Zsh'}};
};

export const setTerminalShells = (
  osPlatform: NodeJS.Platform,
  settings: TerminalSettingsType,
  dispatch: AppDispatch
) => {
  let shellsMap: ShellsMapType = {};

  if (osPlatform === 'win32') {
    shellsMap['powershell'] = {name: 'Powershell'};
    shellsMap['cmd'] = {name: 'Command Prompt'};
  } else {
    shellsMap = detectAvailableUnixShells();
  }

  if (!settings.defaultShell) {
    dispatch(setTerminalSettings({...settings, defaultShell: Object.keys(shellsMap)[0]}));
  }

  dispatch(setShells(shellsMap));

  return shellsMap;
};
