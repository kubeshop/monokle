import {ipcRenderer} from 'electron';

import Nucleus from 'nucleus-nodejs';

import {isRendererThread} from './thread';

export const trackEvent = <TEvent extends Event>(
  eventName: TEvent,
  ...payload: EventMap[TEvent] extends undefined ? [undefined?] : [EventMap[TEvent]]
) => {
  if (isRendererThread()) {
    ipcRenderer.send('track-event', {eventName, payload});
  } else {
    Nucleus.track(eventName, payload as any);
  }
};
export const trackError = (error: any) => {
  if (isRendererThread()) {
    ipcRenderer.send('track-event', {eventName: 'Error', payload: error});
  } else {
    Nucleus.track('Error', error);
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
  CHANGES_BY_SETTINGS_PANEL: {type: string; settingKey: string};
  APPLY: {kind: string} & Record<string, any>;
  DIFF: undefined;
  CLUSTER_COMPARE: {numberOfResourcesBeingCompared: number} | {fail: string};
  FOLLOW_LINK: {type: string};
  QUICK_SEARCH: undefined;
  UPDATE_APPLICATION: undefined;
  APPLY_FILE: undefined;
  APPLY_HELM_CHART: undefined;
  RUN_PREVIEW_CONFIGURATION: undefined;
};

export const CREATE_EMPTY_PROJECT = 'CREATE_EMPTY_PROJECT';
export const SELECT_LEFT_TOOL_PANEL = 'SELECT_LEFT_TOOL_PANEL';
export const START_FROM_A_TEMPLATE = 'START_FROM_A_TEMPLATE';
export const WINDOW_HELP_LINK = 'WINDOW_HELP_LINK';
export const USE_TEMPLATE = 'USE_TEMPLATE';
export const DO_HELM_PREVIEW = 'DO_HELM_PREVIEW';
export const CLUSTER_VIEW = 'CLUSTER_VIEW';
export const DO_KUSTOMIZE_PREVIEW = 'DO_KUSTOMIZE_PREVIEW';
export const OPEN_EXISTING_PROJECT = 'OPEN_EXISTING_PROJECT';
export const ADD_NEW_RESOURCE = 'ADD_NEW_RESOURCE';
export const APP_INSTALLED = 'APP_INSTALLED';
export const CHANGES_BY_FORM_EDITOR = 'CHANGES_BY_FORM_EDITOR';
export const CHANGES_BY_SETTINGS_PANEL = 'CHANGES_BY_SETTINGS_PANEL';
export const APPLY = 'APPLY';
export const DIFF = 'DIFF';
export const CLUSTER_COMPARE = 'CLUSTER_COMPARE';
export const FOLLOW_LINK = 'FOLLOW_LINK';
export const QUICK_SEARCH = 'QUICK_SEARCH';
export const UPDATE_APPLICATION = 'UPDATE_APPLICATION';
export const APPLY_FILE = 'APPLY_FILE';
export const APPLY_HELM_CHART = 'APPLY_HELM_CHART';
export const RUN_PREVIEW_CONFIGURATION = 'RUN_PREVIEW_CONFIGURATION';
