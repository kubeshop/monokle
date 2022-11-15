import {app, shell} from 'electron';

import * as os from 'os';

export function openDiscord() {
  // TODO : use trackEvent from main process
  // trackEvent(WINDOW_HELP_LINK, {linkID: 'discord'});
  shell.openExternal('https://discord.gg/kMJxmuYTMu');
}

export function openDocumentation() {
  // TODO : use trackEvent from main process
  // trackEvent(WINDOW_HELP_LINK, {linkID: 'documentation'});
  shell.openExternal(`https://kubeshop.github.io/monokle?os=${os.type}`);
}

export function openLogs() {
  // TODO : use trackEvent from main process
  //   trackEvent(WINDOW_HELP_LINK, {linkID: 'logs'});
  shell.showItemInFolder(app.getPath('logs'));
}

export function openGitHub() {
  // TODO : use trackEvent from main process
  //   trackEvent(WINDOW_HELP_LINK, {linkID: 'github'});
  shell.openExternal('https://github.com/kubeshop/monokle');
}
