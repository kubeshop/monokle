import {shell} from 'electron';

import * as os from 'os';
// @ts-ignore
import shellPath from 'shell-path';

let cachedShellPath: string | undefined;

export function getShellPath() {
  if (cachedShellPath === undefined) {
    cachedShellPath = shellPath.sync();
  }

  return cachedShellPath;
}

export function showItemInFolder(fullPath: string) {
  shell.showItemInFolder(fullPath);
}

export function openGitHub() {
  shell.openExternal('https://github.com/kubeshop/monokle');
}

export function openDiscord() {
  shell.openExternal('https://discord.gg/kMJxmuYTMu');
}

export function openDocumentation() {
  shell.openExternal(`https://kubeshop.github.io/monokle?os=${os.type}`);
}

export function openUniqueObjectNameTopic() {
  shell.openExternal('https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names');
}

export function openNamespaceTopic() {
  shell.openExternal('https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#rfc-1035-label-names');
}
