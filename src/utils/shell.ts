import {shell} from 'electron';

import * as os from 'os';
import {WINDOW_HELP_LINK, trackEvent} from './telemetry';

export function showItemInFolder(fullPath: string) {
  shell.showItemInFolder(fullPath);
}

export function openGitHub() {
  trackEvent(WINDOW_HELP_LINK, {linkID: 'github'});
  shell.openExternal('https://github.com/kubeshop/monokle');
}

export function openDiscord() {
  trackEvent(WINDOW_HELP_LINK, {linkID: 'discord'});
  shell.openExternal('https://discord.gg/kMJxmuYTMu');
}

export function openUrlInExternalBrowser(url?: string) {
  if (url) {
    shell.openExternal(url);
  }
}

export function openDocumentation() {
  trackEvent(WINDOW_HELP_LINK, {linkID: 'documentation'});
  shell.openExternal(`https://kubeshop.github.io/monokle?os=${os.type}`);
}

export function openKeyboardShortcuts() {
  trackEvent(WINDOW_HELP_LINK, {linkID: 'shortcuts'});
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
