import {ipcRenderer} from 'electron';

export const trackEvent = (eventName: string, payload?: any) => {
  ipcRenderer.send('track-event', {eventName, payload});
};
export const trackError = (error: any) => {
  ipcRenderer.send('track-event', {error});
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
export const CHANGES_BY_FORM_EDITOR = 'CHANGES_BY_FORM_EDITOR';
export const CHANGES_BY_SETTINGS_PANEL = 'CHANGES_BY_SETTINGS_PANEL';
export const APPLY = 'APPLY';
export const DIFF = 'DIFF';
export const CLUSTER_COMPARE = 'CLUSTER_COMPARE';
export const FOLLOW_LINK = 'FOLLOW_LINK';
export const QUICK_SEARCH = 'QUICK_SEARCH';
export const UPDATE_APPLICATION = 'UPDATE_APPLICATION';
