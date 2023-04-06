import {ipcRenderer} from 'electron';

import {cloneDeep, debounce, pick} from 'lodash';
import log from 'loglevel';
import {AnyAction} from 'redux';

import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {RootState} from '@shared/models/rootState';

import {activeProjectSelector} from './appConfig';
import store from './store';

const storeSubscribers: number[] = [];

ipcRenderer.on('redux-dispatch', (_, action: AnyAction) => {
  store.dispatch(action);
});

ipcRenderer.on('redux-get-state', (_, webContentsId: number) => {
  ipcRenderer.send('redux-get-state-fulfilled', {webContentsId, storeState: store.getState()});
});

ipcRenderer.on(
  'redux-subscribe',
  (_, {webContentsId, propertiesToPick}: {webContentsId: number; propertiesToPick: string[]}) => {
    if (storeSubscribers.includes(webContentsId)) {
      log.warn(
        `[ipcRendererRedux]: A redux store subscription for the webContents with id ${webContentsId} already exists.`
      );
      return;
    }
    storeSubscribers.push(webContentsId);
    const sendTrigger = debounce(() => {
      ipcRenderer.send('redux-subscribe-triggered', {
        webContentsId,
        storeState: JSON.stringify(cloneDeep(pick(store.getState(), propertiesToPick))),
        windowTitle: getWindowTitle(store.getState()),
      });
    }, 500);
    store.subscribe(() => {
      sendTrigger();
    });
  }
);

const getWindowTitle = (state: RootState) => {
  let projectName = activeProjectSelector(state)?.name;

  const preview = state.main.preview;
  const localResourceMetaMap = state.main.resourceMetaMapByStorage.local;
  const clusterConnection = state.main.clusterConnection;
  const helmValuesMap = state.main.helmValuesMap;
  const helmChartMap = state.main.helmChartMap;
  const fileMap = state.main.fileMap;

  let windowTitle = 'Monokle';

  if (clusterConnection) {
    windowTitle = `Monokle - previewing context [${clusterConnection.context}]` || 'Monokle';
    return windowTitle;
  }

  if (preview?.type === 'kustomize') {
    const kustomization = localResourceMetaMap[preview.kustomizationId];
    windowTitle = kustomization ? `Monokle - previewing [${kustomization.name}] kustomization` : `Monokle`;
    return windowTitle;
  }

  if (preview?.type === 'helm') {
    const valuesFile = helmValuesMap[preview.valuesFileId];
    const helmChart = helmChartMap[valuesFile.helmChartId];

    windowTitle = `Monokle - previewing ${valuesFile?.name} for ${helmChart?.name} Helm chart`;
    return windowTitle;
  }

  if (fileMap && fileMap[ROOT_FILE_ENTRY] && fileMap[ROOT_FILE_ENTRY].filePath) {
    windowTitle = fileMap[ROOT_FILE_ENTRY].filePath;
    windowTitle = `Monokle - ${projectName} -${windowTitle}`;
    return windowTitle;
  }
};
