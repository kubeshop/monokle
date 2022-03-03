import {shell} from 'electron';

import * as os from 'os';

export function showItemInFolder(fullPath: string) {
  shell.showItemInFolder(fullPath);
}

export function openGitHub() {
  shell.openExternal('https://github.com/kubeshop/monokle');
}

export function openDiscord() {
  shell.openExternal('https://discord.gg/kMJxmuYTMu');
}

export function openUrlInExternalBrowser(url?: string) {
  if (url) {
    shell.openExternal(url);
  }
}

export function openDocumentation() {
  shell.openExternal(`https://kubeshop.github.io/monokle?os=${os.type}`);
}

export function openKeyboardShortcuts() {
  shell.openExternal(`https://kubeshop.github.io/monokle/hotkeys?os=${os.type}`);
}

export function openUniqueObjectNameTopic() {
  shell.openExternal('https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names');
}

export function openNamespaceTopic() {
  shell.openExternal('https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#rfc-1035-label-names');
}

export function openExternalResourceKindDocumentation(resourceKindDocLink?: string) {
  if (resourceKindDocLink) {
    shell.openExternal(resourceKindDocLink);
  }
}
