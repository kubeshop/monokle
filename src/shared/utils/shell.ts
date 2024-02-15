import {app, shell} from 'electron';

import * as os from 'os';

import {trackEvent} from '@shared/utils/telemetry';

export function showItemInFolder(fullPath: string) {
  shell.showItemInFolder(fullPath);
}

export function openTutorialVideo() {
  trackEvent('help/open_link', {linkType: 'video-tutorial'});
  shell.openExternal('https://www.youtube.com/watch?v=wkFWg_S8eUA');
}

export function openGitHub() {
  trackEvent('help/open_link', {linkType: 'github'});
  shell.openExternal('https://github.com/kubeshop/monokle');
}

export function openGitHubAction() {
  trackEvent('help/open_link', {linkType: 'github-action'});
  shell.openExternal('https://github.com/marketplace/actions/monokle-validation');
}

export function openGitHubBot() {
  trackEvent('help/open_link', {linkType: 'github-bot'});
  shell.openExternal('https://github.com/kubeshop/monokle');
}

export function openMonokleCli() {
  trackEvent('help/open_link', {linkType: 'monokle-cli'});
  shell.openExternal('https://github.com/kubeshop/monokle-cli');
}

export function openMonokleChromeExtension() {
  trackEvent('help/open_link', {linkType: 'monokle-chrome-extension'});
  shell.openExternal(
    'https://chrome.google.com/webstore/detail/monokle-cloud-chrome-exte/loojojkleiolidaodalflgbmaijeibob'
  );
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

export function openFeedback() {
  trackEvent('help/open_link', {linkType: 'feedback'});
  shell.openExternal('https://49x902y6r6t.typeform.com/to/vkFBEYYt');
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
  trackEvent('help/open_link', {linkType: 'external_documentation', link: resourceKindDocLink});
  if (resourceKindDocLink) {
    shell.openExternal(resourceKindDocLink);
  }
}
