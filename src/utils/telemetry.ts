import {ipcRenderer} from 'electron';

import {machineIdSync} from 'node-machine-id';
import Nucleus from 'nucleus-nodejs';

import {getSegmentClient} from './segment';
import {isRendererThread} from './thread';

const machineId: string = machineIdSync();

export const trackEvent = <TEvent extends Event>(
  eventName: TEvent,
  ...payload: EventMap[TEvent] extends undefined ? [undefined?] : [EventMap[TEvent]]
) => {
  if (isRendererThread()) {
    ipcRenderer.send('track-event', {eventName, payload});
  } else {
    Nucleus.track(eventName, payload as any);
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
    Nucleus.track('Error', error);
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
  CREATE_EMPTY_PROJECT: undefined;
  SELECT_LEFT_TOOL_PANEL: {panelID: string};
  START_FROM_A_TEMPLATE: {templateID: string};
  WINDOW_HELP_LINK: {linkID: string};
  USE_TEMPLATE: {templateID: string};
  DO_HELM_PREVIEW: undefined;
  CLUSTER_VIEW: {numberOfResourcesInCluster: number};
  DO_KUSTOMIZE_PREVIEW: undefined;
  OPEN_EXISTING_PROJECT: {numberOfFiles: number; numberOfResources: number};
  ADD_NEW_RESOURCE: {resourceKind: string};
  APP_INSTALLED: {appVersion: string};
  CHANGES_BY_FORM_EDITOR: {resourceKind?: string};
  APPLY: {kind: string} & Record<string, any>;
  DIFF: undefined;
  CLUSTER_COMPARE: {numberOfResourcesBeingCompared: number} | {fail: string};
  FOLLOW_LINK: {type: string};
  QUICK_SEARCH: undefined;
  UPDATE_APPLICATION: undefined;
  APPLY_FILE: undefined;
  APPLY_HELM_CHART: undefined;
  RUN_PREVIEW_CONFIGURATION: undefined;
  VALIDATION_PANE_OPENED: {id: string};
  OPA_ENABLED: {all: boolean};
  OPA_DISABLED: {all: boolean};
  COMPARE_OPENED: {from?: string};
  COMPARE_COMPARED: {left?: string; right?: string; operation: string};
  COMPARE_INSPECTED: {type?: string};
  COMPARE_TRANSFERED: {from?: string; to?: string; count: number};
};
