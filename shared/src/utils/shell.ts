import {app, shell} from 'electron';

import * as os from 'os';

import {WINDOW_HELP_LINK} from '../constants/telemetry';
import {trackEvent} from './telemetry';

export function openDiscord() {
  trackEvent(WINDOW_HELP_LINK, {linkID: 'discord'});
  shell.openExternal('https://discord.gg/kMJxmuYTMu');
}

export function openDocumentation() {
  trackEvent(WINDOW_HELP_LINK, {linkID: 'documentation'});
  shell.openExternal(`https://kubeshop.github.io/monokle?os=${os.type}`);
}

export function openLogs() {
  trackEvent(WINDOW_HELP_LINK, {linkID: 'logs'});
  shell.showItemInFolder(app.getPath('logs'));
}

export function openGitHub() {
  trackEvent(WINDOW_HELP_LINK, {linkID: 'github'});
  shell.openExternal('https://github.com/kubeshop/monokle');
}
