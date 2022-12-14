import {ipcRenderer} from 'electron';

import {machineIdSync} from 'node-machine-id';

import {getSegmentClient} from './segment';
import {isRendererThread} from './thread';

const machineId: string = machineIdSync();

export const trackEvent = <TEvent extends Event>(eventName: TEvent, payload?: EventMap[TEvent]) => {
  if (isRendererThread()) {
    ipcRenderer.send('track-event', {eventName, payload});
  } else {
    const segmentClient = getSegmentClient();
    segmentClient?.track({
      event: eventName,
      properties: payload,
      userId: machineId,
    });
  }
};
export const trackError = (error: any) => {
  if (isRendererThread()) {
    ipcRenderer.send('track-event', {eventName: 'Error', payload: error});
  } else {
    const segmentClient = getSegmentClient();
    segmentClient?.track({
      event: 'Error',
      properties: error,
      userId: machineId,
    });
  }
};

export type Event = keyof EventMap;
export type EventMap = {
  APP_INSTALLED: {appVersion: string; deviceOS: string};
  APP_SESSION: undefined;
  APP_UPDATED: undefined;
  'app_start/open_project': {numberOfFiles: number; numberOfResources: number; executionTime: number};
  'app_start/create_project': {from: 'scratch' | 'git' | 'template'; templateID?: string};
  'app_start/quick_cluster_preview': undefined;
  'configure/cluster_version': undefined;
  'configure/opa_enabled': {all: boolean};
  'configure/opa_disabled': {all: boolean};
  'configure/opa_edit_policies': undefined;
  'configure/crds_register': {from: 'url' | 'file'};
  'explore/navigate_resource_link': {type: string};
  'explore/navigate_resource_error': undefined;
  'explore/select_left_tool_panel': {panelID: string};
  'explore/quick_search': undefined;
  'edit/template_use': {templateID: string};
  'edit/resource': {resourceKind: string};
  'edit/file': undefined;
  'edit/form_editor': {resourceKind?: string};
  'edit/side_by_side_editor': {resourceKind: string};
  'create/resource': {resourceKind: string};
  'help/open_link': {linkType: string};
  'preview/helm': {resourcesCount?: number; executionTime: number};
  'preview/helm_preview_configuration': {resourcesCount?: number; executionTime: number};
  'preview/kustomize': {resourcesCount?: number; executionTime: number};
  'preview/cluster': {resourcesCount: number; executionTime: number};
  'preview/command': {resourcesCount: number; executionTime: number};
  'preview/restart': {type: 'helm' | 'kustomization' | 'cluster' | 'helm-preview-config' | 'command'};
  'cluster/diff_resource': undefined;
  'cluster/deploy_resource': {kind: string};
  'cluster/deploy_file': undefined;
  'cluster/deploy_helm_chart': undefined;
  'cluster/deploy_kustomization': undefined;
  'compare/opened': {from?: string};
  'compare/compared': {left?: string; right?: string; operation: string};
  'compare/inspected': {type?: string};
  'compare/transfered': {from?: string; to?: string; count: number};
  'git/branch_checkout': undefined;
  'git/commit': undefined;
  'git/initialize': undefined;
  'git/push': undefined;
  'dashboard/open': {from: string};
  'dashboard/selectKind': {kind: string};
  'dashboard/selectTab': {tab: string};
  'dashboard/changeNamespace': undefined;
  'top-menu/new-project': {type: string};
  CLUSTER_COMPARE: any; // TODO: remove this event in 2.0, keeping to make merging easier
};
export const APP_INSTALLED = 'APP_INSTALLED';
export const APP_SESSION = 'APP_SESSION';
export const DISABLED_TELEMETRY = 'DISABLED_TELEMETRY';
export const CLUSTER_COMPARE = 'CLUSTER_COMPARE';
