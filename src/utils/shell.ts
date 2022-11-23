import {shell} from 'electron';

export function showItemInFolder(fullPath: string) {
  shell.showItemInFolder(fullPath);
}

export function openUrlInExternalBrowser(url?: string) {
  if (url) {
    shell.openExternal(url);
  }
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
