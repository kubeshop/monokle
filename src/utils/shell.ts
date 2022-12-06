import {app, shell} from 'electron';

import * as os from 'os';

import {trackEvent} from './telemetry';

export function showItemInFolder(fullPath: string) {
  shell.showItemInFolder(fullPath);
}

export function openGitHub() {
  trackEvent('help/open_link', {linkType: 'github'});
  shell.openExternal('https://github.com/kubeshop/monokle');
}

export function openDiscord() {
  trackEvent('help/open_link', {linkType: 'discord'});
  shell.openExternal('https://discord.gg/kMJxmuYTMu');
}

export function openUrlInExternalBrowser(url?: string) {
  if (url) {
    shell.openExternal(url);
  }
}

export function openDocumentation() {
  trackEvent('help/open_link', {linkType: 'documentation'});
  shell.openExternal(`https://kubeshop.github.io/monokle?os=${os.type}`);
}

export function openLogs() {
  trackEvent('help/open_link', {linkType: 'logs'});
  shell.showItemInFolder(app.getPath('logs'));
}

export function openUniqueObjectNameTopic() {
  shell.openExternal('https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names');
}

export function openNamespaceTopic() {
  shell.openExternal('https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces');
}

export function openExternalResourceKindDocumentation(resourceKindDocLink?: string) {
  if (resourceKindDocLink) {
    shell.openExternal(resourceKindDocLink);
  }
}
