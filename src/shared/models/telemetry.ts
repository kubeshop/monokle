import {ipcRenderer} from 'electron';

import {machineIdSync} from 'node-machine-id';

import {getSegmentClient} from '@shared/utils/segment';
import {isRendererThread} from '@shared/utils/thread';

import {PreviewType} from './preview';
import {LeftMenuBottomSelectionType, LeftMenuSelectionType} from './ui';

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

export type Event = keyof EventMap;
export type EventMap = {
  APP_INSTALLED: {appVersion: string; deviceOS: string};
  APP_SESSION: {appVersion: string};
  APP_UPDATED: {oldVersion: string; newVersion: string};
  APP_DOWNGRADED: {oldVersion: string; newVersion: string};
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
  'help/open_link': {linkType: string; link?: string};
  'preview/helm/start': undefined;
  'preview/helm/end': {resourcesCount?: number; executionTime: number};
  'preview/helm_config/start': undefined;
  'preview/helm_config/end': {resourcesCount?: number; executionTime: number};
  'preview/kustomize/start': undefined;
  'preview/kustomize/end': {resourcesCount?: number; executionTime: number};
  'preview/cluster/start': undefined;
  'preview/cluster/end': {resourcesCount: number; executionTime: number};
  'preview/command/start': undefined;
  'preview/command/end': {resourcesCount: number; executionTime: number};
  'preview/restart': {type: PreviewType};
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
  'left-menu/select-option': {option: LeftMenuSelectionType};
  'bottom-left-menu/select-option': {option: LeftMenuBottomSelectionType};
  'accordion/select-panel': {panelKey: string};
};
export const APP_INSTALLED = 'APP_INSTALLED';
export const APP_SESSION = 'APP_SESSION';
export const APP_UPDATED = 'APP_UPDATED';
export const APP_DOWNGRADED = 'APP_DOWNGRADED';
export const DISABLED_TELEMETRY = 'DISABLED_TELEMETRY';
