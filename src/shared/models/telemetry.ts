import {ipcRenderer} from 'electron';

import {machineIdSync} from 'node-machine-id';

import {getSegmentClient} from '@shared/utils/segment';
import {isRendererThread} from '@shared/utils/thread';

import {PreviewType} from './preview';
import {NewResourceTelemtryFrom, NewResourceTelemtryType} from './resourceCreate';
import {LeftMenuBottomSelectionType, LeftMenuSelectionType} from './ui';

const machineId: string = machineIdSync();

export const translateNamespaceToTrackableName = (namespace: string) => {
  return ['<all>', '<not-namespaced>', 'default', 'kube-system', 'kube-public'].includes(namespace)
    ? namespace
    : 'custom';
};

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
  APP_QUIT: {exitCode: number};
  APP_SESSION_END: {timeSpent: number};
  'app_start/open_project': {
    numberOfFiles: number;
    numberOfResources: number;
    numberOfOverlays: number;
    numberOfHelmCharts: number;
    numberOfValuesFiles: number;
    executionTime: number;
  };
  'app_start/create_project': {
    from: 'sample' | 'scratch' | 'git' | 'template' | 'folder' | 'helm';
    templateID?: string;
  };
  'app_start/select_page': {page: string};
  'app_start/select_project': undefined;
  'project_list/open_project': undefined;
  'project_list/pin_project': undefined;
  'project_list/unpin_project': undefined;
  'project_list/delete_project': undefined;
  'learn/select_topic': {topic: string};
  'configure/k8s_version': {version: string; scope: 'global' | 'project'; where: 'settings' | 'header'};
  'configure/crds_register': {from: 'url' | 'file'};
  'configure/toggle_validation': {id: string};
  'configure/toggle_rule': {id: string};
  'explore/navigate_resource_link': {type: string};
  'explore/navigate_resource_error': undefined;
  'explore/select_file': undefined;
  'explore/select_resource': {kind: string};
  'explore/select_overlay': undefined;
  'explore/select_image': undefined;
  'explore/select_chart': undefined;
  'explore/select_values_file': undefined;
  'explore/select_kind': {kind: string; expand: boolean};
  'explore/collapse_all': undefined;
  'explore/expand_all': undefined;
  'navigator/collapse_all': undefined;
  'navigator/expand_all': undefined;
  'explore/select_preview_configuration': undefined;
  'explore/select_problem': {ruleId: string; source: string};
  'explore/quick_search': undefined;
  'graph/select_resource': {kind: string};
  'graph/select_image': undefined;
  'edit/code_changes': {from?: 'local' | 'cluster'; resourceKind?: string};
  'edit/template_use': {templateID: string};
  'edit/form_editor': {resourceKind?: string};
  'edit/source': {resourceKind?: string};
  'edit/side_by_side_editor': {resourceKind: string};
  'edit/select_hover_link': {type: 'resource' | 'image' | 'file'};
  'edit/graphview': {resourceKind?: string};
  'editor/hover': {types?: string[]; resourceKind?: string};
  'editor/follow_link': {types?: string[]; resourceKind?: string};
  'editor/run_command': {type: string; resourceKind?: string};
  'create/file': undefined;
  'create/folder': undefined;
  'create/resource': {resourceKind: string};
  'create/preview_configuration': undefined;
  'help/open_link': {linkType: string; link?: string};
  'help/create_issue': undefined;
  'preview/helm/start': undefined;
  'preview/helm/fail': {reason: string};
  'preview/helm/end': {resourcesCount?: number; executionTime: number};
  'preview/helm_config/start': undefined;
  'preview/helm_config/fail': {reason: string};
  'preview/helm_config/end': {resourcesCount?: number; executionTime: number};
  'preview/kustomize/start': undefined;
  'preview/kustomize/fail': {reason: string};
  'preview/kustomize/end': {resourcesCount?: number; executionTime: number};
  'preview/cluster/start': {namespace?: string};
  'preview/cluster/fail': {reason: string};
  'preview/cluster/end': {resourcesCount: number; executionTime: number};
  'preview/command/start': undefined;
  'preview/command/fail': {reason: string};
  'preview/command/end': {resourcesCount: number; executionTime: number};
  'preview/restart': {type: PreviewType};
  'helm/command/start': {command: string[]};
  'helm/command/fail': {reason: string};
  'helm/command/end': undefined;
  'cluster/diff_resource': undefined;
  'cluster/deploy_resource': {kind: string};
  'cluster/deploy_file': undefined;
  'cluster/deploy_helm_chart': undefined;
  'cluster/deploy_kustomization': undefined;
  'cluster/actions/update_manifest': {kind: string};
  'cluster/actions/scale': {replicasNumber: number};
  'cluster/actions/restart': undefined;
  'cluster/actions/delete': {kind: string};
  'cluster/info': {kubeletVersion?: string; providers: string[]};
  'compare/opened': {from?: string};
  'compare/compared': {left?: string; right?: string; operation: string};
  'compare/inspected': {type?: string};
  'compare/transfered': {from?: string; to?: string; count: number};
  'git/branch_checkout': undefined;
  'git/commit': undefined;
  'git/initialize': undefined;
  'git/push': undefined;
  'git/init': undefined;
  'git/error': {action: string; reason: string};
  'dashboard/open': {from: string};
  'dashboard/selectKind': {kind: string};
  'dashboard/selectTab': {tab: string; kind?: string};
  'dashboard/changeNamespace': {name: string};
  'dashboard/select_event': undefined;
  'dashboard/select_errors': undefined;
  'dashboard/select_warnings': undefined;
  'dashboard/start_activity': undefined;
  'dashboard/pause_activity': undefined;
  'terminal/open': undefined;
  'terminal/add': undefined;
  'terminal/kill': undefined;
  'left-menu/activity-changed': {activity: LeftMenuSelectionType; section?: string};
  'bottom-left-menu/select-option': {option: LeftMenuBottomSelectionType};
  'notifications/toggle': undefined;
  'new_resource/create': {type: NewResourceTelemtryType; from: NewResourceTelemtryFrom};
  'helm_repo/search': {query: string};
  'helm_repo/select': undefined;
  'helm_repo/add': undefined;
  'helm_repo/remove': undefined;
  'helm_repo/update': undefined;
  'helm_repo/download': undefined;
  'helm_repo/install': undefined;
  'ai/generation/open': undefined;
  'ai/generation/no-api-key-set': undefined;
  'ai/generation/error': {message: string};
  'ai/generation/success': {
    enabledValidation: boolean;
    executionTime: number;
  };
  'ai/generation/created-resources': {resourceKinds: string[]; resourcesCount: number};
  'logs/search': {resourceKind: string};
  'validation/load_config': {actionType: string};
  'validation/validate_all': {actionType: string};
  'validation/validate_incremental': {actionType: string};
  'helm_release/search': undefined;
  'helm_release/select': undefined;
  'helm_release/release_select_tab': {tab: string};
  'helm_release/select_resource': {kind: string};
  'helm_release/revision_diff': undefined;
  'helm_release/upgrade': {dryRun: boolean; status?: 'failed' | 'succeeded'};
  'helm_release/uninstall': {dryRun: boolean; status?: 'failed' | 'succeeded'};
  'helm_release/rollback': {status?: 'failed' | 'succeeded' | 'canceled'};
  'helm_release/navigate_to_helm_repo': undefined;
  'image_resources/select': undefined;
  'image_resources/search': undefined;
  'image_resources/select_resource': {kind: string};
};

export const APP_INSTALLED = 'APP_INSTALLED';
export const APP_SESSION = 'APP_SESSION';
export const APP_UPDATED = 'APP_UPDATED';
export const APP_DOWNGRADED = 'APP_DOWNGRADED';
export const DISABLED_TELEMETRY = 'DISABLED_TELEMETRY';
export const APP_QUIT = 'APP_QUIT';
