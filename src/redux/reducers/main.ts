import {exec} from 'child_process';
import log from 'loglevel';
// @ts-ignore
import shellPath from 'shell-path';
import {createSlice, Draft, original, PayloadAction} from '@reduxjs/toolkit';
import path from 'path';
import {PREVIEW_PREFIX, ROOT_FILE_ENTRY, YAML_DOCUMENT_DELIMITER} from '@src/constants';
import {AppConfig} from '@models/appconfig';
import {AppState, FileMapType, ResourceMapType} from '@models/appstate';
import {FileEntry} from '@models/fileentry';
import {parseDocument, stringify} from 'yaml';
import fs from 'fs';
import {monitorRootFolder} from '@redux/utils/fileMonitor';
import * as k8s from '@kubernetes/client-node';
import {initialState} from '../initialState';
import {
  clearFileSelections,
  clearResourceSelections,
  highlightChildrenResources,
  updateSelectionAndHighlights,
} from '../utils/selection';
import {
  addPath,
  removePath,
  extractK8sResources,
  getAllFileEntriesForPath,
  getFileEntryForAbsolutePath,
  getResourcesInFile,
  readFiles,
  reloadFile,
} from '../utils/fileEntry';
import {processKustomizations} from '../utils/kustomize';
import {processParsedResources, recalculateResourceRanges, reprocessResources, saveResource} from '../utils/resource';
import {AppDispatch} from '../store';

type SetRootFolderPayload = {
  appConfig: AppConfig;
  fileMap: FileMapType;
  resourceMap: ResourceMapType;
};

type SetPreviewDataPayload = {
  previewResourceId?: string;
  previewResources?: ResourceMapType;
};

export type UpdateResourcePayload = {
  resourceId: string;
  content: string;
};

export type UpdateFileEntryPayload = {
  path: string;
  content: string;
};

export const mainSlice = createSlice({
  name: 'main',
  initialState,
  reducers: {
    pathAdded: (state: Draft<AppState>, action: PayloadAction<string>) => {
      let filePath = action.payload;
      let fileEntry = getFileEntryForAbsolutePath(filePath, state.fileMap);
      if (fileEntry) {
        log.info(`added file ${filePath} already exists - updating`);
        reloadFile(filePath, fileEntry, state);
      } else {
        addPath(filePath, state);
      }
    },
    fileChanged: (state: Draft<AppState>, action: PayloadAction<string>) => {
      let filePath = action.payload;
      let fileEntry = getFileEntryForAbsolutePath(filePath, state.fileMap);
      if (fileEntry) {
        reloadFile(filePath, fileEntry, state);
      } else {
        addPath(filePath, state);
      }
    },
    pathRemoved: (state: Draft<AppState>, action: PayloadAction<string>) => {
      let filePath = action.payload;
      let fileEntry = getFileEntryForAbsolutePath(filePath, state.fileMap);
      if (fileEntry) {
        removePath(filePath, state, fileEntry);
      } else {
        log.warn(`removed file ${filePath} not known - ignoring..`);
      }
    },
    updateFileEntry: (state: Draft<AppState>, action: PayloadAction<UpdateFileEntryPayload>) => {
      try {
        const fileEntry = state.fileMap[action.payload.path];
        if (fileEntry) {
          let rootFolder = state.fileMap[ROOT_FILE_ENTRY].filePath;
          const filePath = path.join(rootFolder, action.payload.path);

          if (!fs.statSync(filePath).isDirectory()) {
            fs.writeFileSync(filePath, action.payload.content);
            fileEntry.timestamp = fs.statSync(filePath).mtime.getTime();

            getResourcesInFile(fileEntry.filePath, state.resourceMap).forEach(r => {
              delete state.resourceMap[r.id];
            });

            const resources = extractK8sResources(action.payload.content, filePath.substring(rootFolder.length));
            Object.values(resources).forEach(r => {
              state.resourceMap[r.id] = r;
              r.highlight = true;
            });

            reprocessResources([], state.resourceMap, state.fileMap);
          }
        } else {
          log.error(`Could not find FileEntry for ${action.payload.path}`);
        }
      } catch (e) {
        log.error(e);
        return original(state);
      }
    },
    updateResource: (state: Draft<AppState>, action: PayloadAction<UpdateResourcePayload>) => {
      try {
        const resource = state.resourceMap[action.payload.resourceId];
        if (resource) {
          const value = saveResource(resource, action.payload.content, state.fileMap);
          resource.text = value;
          resource.content = parseDocument(value).toJS();
          recalculateResourceRanges(resource, state);
          reprocessResources([resource.id], state.resourceMap, state.fileMap);
          resource.selected = false;
          updateSelectionAndHighlights(state, resource);
        }
      } catch (e) {
        log.error(e);
        return original(state);
      }
    },
    rootFolderSet: (state: Draft<AppState>, action: PayloadAction<SetRootFolderPayload>) => {
      state.resourceMap = action.payload.resourceMap;
      state.fileMap = action.payload.fileMap;
      state.selectedResource = undefined;
      state.selectedPath = undefined;
      state.previewResource = undefined;
    },
    setPreviewData: (state: Draft<AppState>, action: PayloadAction<SetPreviewDataPayload>) => {
      state.previewResource = action.payload.previewResourceId;

      // remove previous preview resources
      Object.values(state.resourceMap)
        .filter(r => r.filePath.startsWith(PREVIEW_PREFIX))
        .forEach(r => delete state.resourceMap[r.id]);

      if (action.payload.previewResourceId && action.payload.previewResources) {
        Object.values(action.payload.previewResources).forEach(r => {
          state.resourceMap[r.id] = r;
        });
      }
    },
    selectK8sResource: (state: Draft<AppState>, action: PayloadAction<string>) => {
      const resource = state.resourceMap[action.payload];
      if (resource) {
        updateSelectionAndHighlights(state, resource);
      }
    },
    selectFile: (state: Draft<AppState>, action: PayloadAction<string>) => {
      if (action.payload.length > 0) {
        const selectedPath = action.payload;
        const entries = getAllFileEntriesForPath(action.payload, state.fileMap);
        clearResourceSelections(state.resourceMap);
        clearFileSelections(state.fileMap);

        if (entries.length > 0) {
          entries
            .filter(e => e.children)
            .forEach(e => {
              e.expanded = true;
            });

          const parent = entries[entries.length - 1];
          getResourcesInFile(parent.filePath, state.resourceMap).forEach(r => {
            r.highlight = true;
          });

          if (parent.children) {
            highlightChildrenResources(parent, state.resourceMap, state.fileMap);
          }
        }

        state.selectedResource = undefined;
        state.selectedPath = selectedPath;
      }
    },
  },
});

/**
 * Thunk to set the specified root folder
 */

export function setRootFolder(rootFolder: string, appConfig: AppConfig) {
  return async (dispatch: AppDispatch) => {
    const folderPath = path.parse(rootFolder);
    const resourceMap: ResourceMapType = {};
    const fileMap: FileMapType = {};

    const rootEntry: FileEntry = {
      name: folderPath.name,
      filePath: rootFolder,
      highlight: false,
      selected: false,
      expanded: false,
      excluded: false,
      children: [],
    };

    fileMap[ROOT_FILE_ENTRY] = rootEntry;

    rootEntry.children = readFiles(rootFolder, appConfig, resourceMap, fileMap);
    processKustomizations(resourceMap, fileMap);
    processParsedResources(resourceMap);

    monitorRootFolder(rootFolder, appConfig, dispatch);

    dispatch(
      mainSlice.actions.rootFolderSet({
        appConfig,
        fileMap,
        resourceMap,
      })
    );
  };
}

/**
 * Thunk to preview a kustomization
 */

export function previewKustomization(id: string) {
  // eslint-disable-next-line no-unused-vars
  return async (dispatch: AppDispatch, getState: any) => {
    const state: AppState = getState().main;
    if (state.previewResource === id) {
      dispatch(mainSlice.actions.setPreviewData({}));
    } else {
      const resource = state.resourceMap[id];
      if (resource && resource.filePath) {
        const rootFolder = state.fileMap[ROOT_FILE_ENTRY].filePath;
        const folder = path.join(rootFolder, resource.filePath.substr(0, resource.filePath.lastIndexOf(path.sep)));
        log.info(`previewing ${id} in folder ${folder}`);

        // need to run kubectl for this since the kubernetes client doesn't support kustomization commands
        exec(
          'kubectl kustomize ./',
          {
            cwd: folder,
            env: {
              NODE_ENV: process.env.NODE_ENV,
              PUBLIC_URL: process.env.PUBLIC_URL,
              PATH: shellPath.sync(),
            },
          },
          (error, stdout, stderr) => {
            if (error) {
              log.error(`Failed to generate kustomizations: ${error.message}`);
              return;
            }
            if (stderr) {
              log.error(`Failed to generate kustomizations: ${stderr}`);
              return;
            }

            const resourceMap: ResourceMapType = {};

            extractK8sResources(stdout, PREVIEW_PREFIX + resource.id).forEach(r => {
              resourceMap[r.id] = r;
            });
            processParsedResources(resourceMap);

            dispatch(mainSlice.actions.setPreviewData({previewResourceId: id, previewResources: resourceMap}));
          }
        );
      }
    }
  };
}

/**
 * Utility to convert list of objects returned by k8s api to a single YAML document
 */

function getK8sObjectsAsYaml(items: any[], kind: string, apiVersion: string) {
  return items
    .map(item => {
      item.kind = kind;
      item.apiVersion = apiVersion;
      delete item.metadata?.managedFields;
      return stringify(item);
    })
    .join(YAML_DOCUMENT_DELIMITER);
}

/**
 * Thunk to preview cluster objects
 */

export function previewCluster(configPath: string) {
  return async (dispatch: AppDispatch, getState: any) => {
    const state: AppState = getState().main;
    if (state.previewResource === configPath) {
      dispatch(mainSlice.actions.setPreviewData({}));
    } else {
      const kc = new k8s.KubeConfig();
      kc.loadFromFile(configPath);
      const k8sAppV1Api = kc.makeApiClient(k8s.AppsV1Api);
      const k8sCoreV1Api = kc.makeApiClient(k8s.CoreV1Api);

      Promise.all([
        k8sAppV1Api.listDeploymentForAllNamespaces().then(res => {
          return getK8sObjectsAsYaml(res.body.items, 'Deployment', 'apps/v1');
        }),
        k8sCoreV1Api.listConfigMapForAllNamespaces().then(res => {
          return getK8sObjectsAsYaml(res.body.items, 'ConfigMap', 'core/v1');
        }),
        k8sCoreV1Api.listServiceForAllNamespaces().then(res => {
          return getK8sObjectsAsYaml(res.body.items, 'Service', 'core/v1');
        }),
      ]).then(yamls => {
        const allYaml = yamls.join(YAML_DOCUMENT_DELIMITER);
        const resources = extractK8sResources(allYaml, PREVIEW_PREFIX + configPath);

        if (resources && resources.length > 0) {
          const resourceMap = resources.reduce((acc: ResourceMapType, item) => {
            acc[item.id] = item;
            return acc;
          }, {});

          processParsedResources(resourceMap);
          dispatch(mainSlice.actions.setPreviewData({previewResourceId: configPath, previewResources: resourceMap}));
        }
      });
    }
  };
}

export const {selectK8sResource, selectFile, updateResource, updateFileEntry, pathAdded, fileChanged, pathRemoved} =
  mainSlice.actions;
export default mainSlice.reducer;
