import {shell} from 'electron';

import * as os from 'os';
// @ts-ignore
import shellPath from 'shell-path';

import {ResourceKind} from '@models/resourcekindhandler';

let cachedShellPath: string | undefined;

// Documentation links hash-table
export const resourceKindDocLinks: {[name: string]: string} = {
  ConfigMap: 'https://kubernetes.io/docs/concepts/configuration/configmap/',
  Secret: 'https://kubernetes.io/docs/concepts/configuration/secret/',
  Namespace: 'https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/',
  Ingress: 'https://kubernetes.io/docs/concepts/services-networking/ingress/',
  ClusterRole: 'https://kubernetes.io/docs/reference/access-authn-authz/rbac/#role-and-clusterrole',
};

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

export function openExternalResourceKindDocumentation(resourceKind: ResourceKind) {
  shell.openExternal(resourceKindDocLinks[resourceKind]);
}
