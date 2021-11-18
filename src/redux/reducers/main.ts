import fs from 'fs';
import log from 'loglevel';
import path from 'path';
import {v4 as uuidv4} from 'uuid';
import {parseDocument} from 'yaml';

import {findResourcesToReprocess} from '@redux/services/resourceRefs';
import {resetSelectionHistory} from '@redux/services/selectionHistory';
import {performResourceDiff} from '@redux/thunks/diffResource';
import {loadClusterDiff} from '@redux/thunks/loadClusterDiff';
import {previewCluster, repreviewCluster} from '@redux/thunks/previewCluster';
import {previewHelmValuesFile} from '@redux/thunks/previewHelmValuesFile';
import {previewKustomization} from '@redux/thunks/previewKustomization';
import {saveUnsavedResource} from '@redux/thunks/saveUnsavedResource';
import {selectFromHistory} from '@redux/thunks/selectionHistory';
import {setRootFolder} from '@redux/thunks/setRootFolder';
import {Draft, PayloadAction, createAsyncThunk, createSlice, original} from '@reduxjs/toolkit';

import {AlertType} from '@models/alert';
import {AppConfig} from '@models/appconfig';
import {
  AppState,
  ClusterToLocalResourcesMatch,
  FileMapType,
  HelmChartMapType,
  HelmValuesMapType,
  ResourceFilterType,
  ResourceMapType,
} from '@models/appstate';
import {K8sResource} from '@models/k8sresource';

import {CLUSTER_DIFF_PREFIX, KUSTOMIZATION_KIND, PREVIEW_PREFIX, ROOT_FILE_ENTRY} from '@constants/constants';

import electronStore from '@utils/electronStore';
import {getFileStats} from '@utils/files';
import {makeResourceNameKindNamespaceIdentifier} from '@utils/resources';

import {getResourceKindHandler} from '@src/kindhandlers';

import initialState from '../initialState';
import {
  addPath,
  createFileEntry,
  getAllFileEntriesForPath,
  getFileEntryForAbsolutePath,
  getResourcesForPath,
  reloadFile,
  removePath,
} from '../services/fileEntry';
import {
  extractK8sResources,
  isFileResource,
  isUnsavedResource,
  recalculateResourceRanges,
  removeResourceFromFile,
  reprocessResources,
  saveResource,
} from '../services/resource';
import {clearResourceSelections, highlightChildrenResources, updateSelectionAndHighlights} from '../services/selection';
import {closeClusterDiff} from './ui';
// eslint-disable-next-line
import * as k8s from '@kubernetes/client-node';

export type SetRootFolderPayload = {
  appConfig: AppConfig;
  fileMap: FileMapType;
  resourceMap: ResourceMapType;
  helmChartMap: HelmChartMapType;
  helmValuesMap: HelmValuesMapType;
  alert?: AlertType;
};

export type UpdateResourcePayload = {
  resourceId: string;
  content: string;
  preventSelectionAndHighlightsUpdate?: boolean;
};

export type UpdateFileEntryPayload = {
  path: string;
  content: string;
};

export type SetPreviewDataPayload = {
  previewResourceId?: string;
  previewResources?: ResourceMapType;
  alert?: AlertType;
  previewKubeConfigPath?: string;
  previewKubeConfigContext?: string;
};

export type SetDiffDataPayload = {
  diffResourceId?: string;
  diffContent?: string;
};

export type StartPreviewLoaderPayload = {
  targetResourceId: string;
  previewType: 'kustomization' | 'helm' | 'cluster';
};

function updateSelectionHistory(type: 'resource' | 'path', isVirtualSelection: boolean, state: AppState) {
  if (isVirtualSelection) {
    return;
  }
  if (type === 'resource' && state.selectedResourceId) {
    state.selectionHistory.push({
      type,
      selectedResourceId: state.selectedResourceId,
    });
  }
  if (type === 'path' && state.selectedPath) {
    state.selectionHistory.push({
      type,
      selectedPath: state.selectedPath,
    });
  }
  state.currentSelectionHistoryIndex = undefined;
}

export const updateShouldOptionalIgnoreUnsatisfiedRefs = createAsyncThunk(
  'main/resourceRefsProcessingOptions/shouldIgnoreOptionalUnsatisfiedRefs',
  async (shouldIgnore: boolean, thunkAPI) => {
    electronStore.set('main.resourceRefsProcessingOptions.shouldIgnoreOptionalUnsatisfiedRefs', shouldIgnore);
    thunkAPI.dispatch(mainSlice.actions.setShouldIgnoreOptionalUnsatisfiedRefs(shouldIgnore));
  }
);

const clearSelectedResourceOnPreviewExit = (state: AppState) => {
  if (state.selectedResourceId) {
    const selectedResource = state.resourceMap[state.selectedResourceId];
    if (selectedResource && selectedResource.filePath.startsWith(PREVIEW_PREFIX)) {
      state.selectedResourceId = undefined;
    }
  }
};

export const mainSlice = createSlice({
  name: 'main',
  initialState: initialState.main,
  reducers: {
    setAppRehydrating: (state: Draft<AppState>, action: PayloadAction<boolean>) => {
      state.isRehydrating = action.payload;
      if (!action.payload) {
        state.wasRehydrated = !action.payload;
      }
    },
    addResource: (state: Draft<AppState>, action: PayloadAction<K8sResource>) => {
      const resource = action.payload;
      state.resourceMap[resource.id] = resource;
    },
    /**
     * called by the file monitor when a path is added to the file system
     */
    pathAdded: (state: Draft<AppState>, action: PayloadAction<{path: string; appConfig: AppConfig}>) => {
      let filePath = action.payload.path;
      const appConfig = action.payload.appConfig;
      let fileEntry = getFileEntryForAbsolutePath(filePath, state.fileMap);
      if (fileEntry) {
        if (getFileStats(filePath)?.isDirectory() === false) {
          log.info(`added file ${filePath} already exists - updating`);
          reloadFile(filePath, fileEntry, state);
        }
      } else {
        addPath(filePath, state, appConfig);
      }
    },
    /**
     * called by the file monitor when multiple paths are added to the file system
     */
    multiplePathsAdded: (
      state: Draft<AppState>,
      action: PayloadAction<{paths: Array<string>; appConfig: AppConfig}>
    ) => {
      let filePaths: Array<string> = action.payload.paths;
      const appConfig = action.payload.appConfig;
      filePaths.forEach((filePath: string) => {
        let fileEntry = getFileEntryForAbsolutePath(filePath, state.fileMap);
        if (fileEntry) {
          if (getFileStats(filePath)?.isDirectory() === false) {
            log.info(`added file ${filePath} already exists - updating`);
            reloadFile(filePath, fileEntry, state);
          }
        } else {
          addPath(filePath, state, appConfig);
        }
      });
    },
    /**
     * called by the file monitor when a file is changed in the file system
     */
    fileChanged: (state: Draft<AppState>, action: PayloadAction<{path: string; appConfig: AppConfig}>) => {
      let filePath = action.payload.path;
      const appConfig = action.payload.appConfig;
      let fileEntry = getFileEntryForAbsolutePath(filePath, state.fileMap);
      if (fileEntry) {
        reloadFile(filePath, fileEntry, state);
      } else {
        addPath(filePath, state, appConfig);
      }
    },
    /**
     * called by the file monitor when multiple files are changed in the file system
     */
    multipleFilesChanged: (
      state: Draft<AppState>,
      action: PayloadAction<{paths: Array<string>; appConfig: AppConfig}>
    ) => {
      let filePaths = action.payload.paths;
      const appConfig = action.payload.appConfig;
      filePaths.forEach((filePath: string) => {
        let fileEntry = getFileEntryForAbsolutePath(filePath, state.fileMap);
        if (fileEntry) {
          reloadFile(filePath, fileEntry, state);
        } else {
          addPath(filePath, state, appConfig);
        }
      });
    },
    /**
     * called by the file monitor when a path is removed from the file system
     */
    pathRemoved: (state: Draft<AppState>, action: PayloadAction<string>) => {
      let filePath = action.payload;
      let fileEntry = getFileEntryForAbsolutePath(filePath, state.fileMap);
      if (fileEntry) {
        removePath(filePath, state, fileEntry);
      } else {
        log.warn(`removed file ${filePath} not known - ignoring..`);
      }
    },
    /**
     * called by the file monitor when a path is removed from the file system
     */
    multiplePathsRemoved: (state: Draft<AppState>, action: PayloadAction<Array<string>>) => {
      let filePaths: Array<string> = action.payload;
      filePaths.forEach((filePath: string) => {
        let fileEntry = getFileEntryForAbsolutePath(filePath, state.fileMap);
        if (fileEntry) {
          removePath(filePath, state, fileEntry);
        } else {
          log.warn(`removed file ${filePath} not known - ignoring..`);
        }
      });
    },
    /**
     * updates the content of the specified path to the specified value
     */
    updateFileEntry: (state: Draft<AppState>, action: PayloadAction<UpdateFileEntryPayload>) => {
      try {
        const fileEntry = state.fileMap[action.payload.path];
        if (fileEntry) {
          let rootFolder = state.fileMap[ROOT_FILE_ENTRY].filePath;
          const filePath = path.join(rootFolder, action.payload.path);

          if (getFileStats(filePath)?.isDirectory() === false) {
            fs.writeFileSync(filePath, action.payload.content);
            fileEntry.timestamp = getFileStats(filePath)?.mtime.getTime();

            getResourcesForPath(fileEntry.filePath, state.resourceMap).forEach(r => {
              delete state.resourceMap[r.id];
            });

            const extractedResources = extractK8sResources(
              action.payload.content,
              filePath.substring(rootFolder.length)
            );

            let resourceIds: string[] = [];

            // only recalculate refs for resources that already have refs
            Object.values(state.resourceMap)
              .filter(r => r.refs)
              .forEach(r => resourceIds.push(r.id));

            Object.values(extractedResources).forEach(r => {
              state.resourceMap[r.id] = r;
              r.isHighlighted = true;
              resourceIds.push(r.id);
            });

            reprocessResources(resourceIds, state.resourceMap, state.fileMap, state.resourceRefsProcessingOptions, {
              resourceKinds: extractedResources.map(r => r.kind),
            });
          }
        } else {
          log.error(`Could not find FileEntry for ${action.payload.path}`);
        }
      } catch (e) {
        log.error(e);
        return original(state);
      }
    },
    /**
     * Updates the content of the specified resource to the specified value
     */
    updateResource: (state: Draft<AppState>, action: PayloadAction<UpdateResourcePayload>) => {
      try {
        const resource = state.resourceMap[action.payload.resourceId];
        if (resource) {
          if (isFileResource(resource)) {
            const updatedFileText = saveResource(resource, action.payload.content, state.fileMap);
            resource.text = updatedFileText;
            resource.content = parseDocument(updatedFileText).toJS();
            recalculateResourceRanges(resource, state);
          } else {
            resource.text = action.payload.content;
            resource.content = parseDocument(action.payload.content).toJS();
          }

          let resources = findResourcesToReprocess(resource, state.resourceMap);

          reprocessResources(resources, state.resourceMap, state.fileMap, state.resourceRefsProcessingOptions);
          if (!action.payload.preventSelectionAndHighlightsUpdate) {
            resource.isSelected = false;
            updateSelectionAndHighlights(state, resource);
          }
        }
      } catch (e) {
        log.error(e);
        return original(state);
      }
    },
    removeResource: (state: Draft<AppState>, action: PayloadAction<string>) => {
      const resourceId = action.payload;
      const resource = state.resourceMap[resourceId];
      if (!resource) {
        return;
      }
      if (state.selectedResourceId === resourceId) {
        clearResourceSelections(state.resourceMap);
      }
      if (isUnsavedResource(resource)) {
        delete state.resourceMap[resource.id];
        return;
      }
      if (isFileResource(resource)) {
        removeResourceFromFile(resource, state.fileMap, state.resourceMap);
        return;
      }
      if (state.previewType === 'cluster' && state.previewKubeConfigPath && state.previewKubeConfigContext) {
        try {
          const kubeConfig = new k8s.KubeConfig();
          kubeConfig.loadFromFile(state.previewKubeConfigPath);
          kubeConfig.setCurrentContext(state.previewKubeConfigContext);

          const kindHandler = getResourceKindHandler(resource.kind);
          if (kindHandler?.deleteResourceInCluster) {
            kindHandler.deleteResourceInCluster(kubeConfig, resource.name, resource.namespace);
            delete state.resourceMap[resource.id];
          }
        } catch (err) {
          log.error(err);
          return original(state);
        }
      }
    },
    /**
     * Marks the specified resource as selected and highlights all related resources
     */
    selectK8sResource: (
      state: Draft<AppState>,
      action: PayloadAction<{resourceId: string; isVirtualSelection?: boolean}>
    ) => {
      const resource = state.resourceMap[action.payload.resourceId];
      if (resource) {
        updateSelectionAndHighlights(state, resource);
        updateSelectionHistory('resource', Boolean(action.payload.isVirtualSelection), state);
      }
    },
    /**
     * Marks the specified values as selected
     */
    selectHelmValuesFile: (
      state: Draft<AppState>,
      action: PayloadAction<{valuesFileId: string; isVirtualSelection?: boolean}>
    ) => {
      const valuesFileId = action.payload.valuesFileId;
      Object.values(state.helmValuesMap).forEach(values => {
        values.isSelected = values.id === valuesFileId;
      });

      state.selectedValuesFileId = state.helmValuesMap[valuesFileId].isSelected ? valuesFileId : undefined;
      selectFilePath(state.helmValuesMap[valuesFileId].filePath, state);
      updateSelectionHistory('path', Boolean(action.payload.isVirtualSelection), state);
    },
    /**
     * Marks the specified file as selected and highlights all related resources
     */
    selectFile: (state: Draft<AppState>, action: PayloadAction<{filePath: string; isVirtualSelection?: boolean}>) => {
      const filePath = action.payload.filePath;
      if (filePath.length > 0) {
        selectFilePath(filePath, state);
        updateSelectionHistory('path', Boolean(action.payload.isVirtualSelection), state);
      }
    },
    setSelectingFile: (state: Draft<AppState>, action: PayloadAction<boolean>) => {
      state.isSelectingFile = action.payload;
    },
    setApplyingResource: (state: Draft<AppState>, action: PayloadAction<boolean>) => {
      state.isApplyingResource = action.payload;
    },
    clearPreview: (state: Draft<AppState>) => {
      clearSelectedResourceOnPreviewExit(state);
      setPreviewData({}, state);
      state.previewType = undefined;
    },
    clearPreviewAndSelectionHistory: (state: Draft<AppState>) => {
      clearSelectedResourceOnPreviewExit(state);
      setPreviewData({}, state);
      state.previewType = undefined;
      state.currentSelectionHistoryIndex = undefined;
      state.selectionHistory = [];
      state.clusterDiff.shouldReload = true;
    },
    startPreviewLoader: (state: Draft<AppState>, action: PayloadAction<StartPreviewLoaderPayload>) => {
      state.previewLoader.isLoading = true;
      state.previewLoader.targetResourceId = action.payload.targetResourceId;
      state.previewType = action.payload.previewType;
    },
    stopPreviewLoader: (state: Draft<AppState>) => {
      state.previewLoader.isLoading = false;
      state.previewLoader.targetResourceId = undefined;
    },
    updateResourceFilter: (state: Draft<AppState>, action: PayloadAction<ResourceFilterType>) => {
      state.resourceFilter = action.payload;
    },
    setShouldIgnoreOptionalUnsatisfiedRefs: (state: Draft<AppState>, action: PayloadAction<boolean>) => {
      state.resourceRefsProcessingOptions.shouldIgnoreOptionalUnsatisfiedRefs = action.payload;
    },
    addNotification: (state: Draft<AppState>, action: PayloadAction<AlertType>) => {
      const notification: AlertType = action.payload;
      notification.id = uuidv4();
      notification.hasSeen = false;
      notification.createdAt = new Date().getTime();
      state.notifications = [notification, ...state.notifications];
    },
    setDiffResourceInClusterDiff: (state: Draft<AppState>, action: PayloadAction<string | undefined>) => {
      state.clusterDiff.diffResourceId = action.payload;
    },
    setClusterDiffRefreshDiffResource: (state: Draft<AppState>, action: PayloadAction<boolean | undefined>) => {
      state.clusterDiff.refreshDiffResource = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(previewKustomization.fulfilled, (state, action) => {
        setPreviewData(action.payload, state);
        state.previewLoader.isLoading = false;
        state.previewLoader.targetResourceId = undefined;
        resetSelectionHistory(state, {initialResourceIds: [state.previewResourceId]});
        state.selectedResourceId = action.payload.previewResourceId;
        state.selectedPath = undefined;
        state.selectedValuesFileId = undefined;
        state.clusterDiff.shouldReload = true;
      })
      .addCase(previewKustomization.rejected, state => {
        state.previewLoader.isLoading = false;
        state.previewLoader.targetResourceId = undefined;
        state.previewType = undefined;
      });

    builder
      .addCase(previewHelmValuesFile.fulfilled, (state, action) => {
        setPreviewData(action.payload, state);
        state.previewLoader.isLoading = false;
        state.previewLoader.targetResourceId = undefined;
        state.currentSelectionHistoryIndex = undefined;
        resetSelectionHistory(state);
        state.selectedResourceId = undefined;
        state.selectedPath = undefined;
        state.selectedValuesFileId = action.payload.previewResourceId;
      })
      .addCase(previewHelmValuesFile.rejected, (state, action) => {
        state.previewLoader.isLoading = false;
        state.previewLoader.targetResourceId = undefined;
        state.previewType = undefined;
      });

    builder
      .addCase(previewCluster.fulfilled, (state, action) => {
        setPreviewData(action.payload, state);
        state.previewLoader.isLoading = false;
        state.previewLoader.targetResourceId = undefined;
        resetSelectionHistory(state, {initialResourceIds: [state.previewResourceId]});
        state.selectedResourceId = undefined;
      })
      .addCase(previewCluster.rejected, state => {
        state.previewLoader.isLoading = false;
        state.previewLoader.targetResourceId = undefined;
        state.previewType = undefined;
      });

    builder
      .addCase(repreviewCluster.fulfilled, (state, action) => {
        setPreviewData(action.payload, state);
        state.previewLoader.isLoading = false;
        state.previewLoader.targetResourceId = undefined;
        let resource = null;
        if (action && action.payload && action.payload.previewResources && state && state.selectedResourceId) {
          resource = action.payload.previewResources[state.selectedResourceId];
        }
        if (resource) {
          updateSelectionAndHighlights(state, resource);
        }
      })
      .addCase(repreviewCluster.rejected, state => {
        state.previewLoader.isLoading = false;
        state.previewLoader.targetResourceId = undefined;
        state.previewType = undefined;
      });

    builder.addCase(setRootFolder.fulfilled, (state, action) => {
      state.resourceMap = action.payload.resourceMap;
      state.fileMap = action.payload.fileMap;
      state.helmChartMap = action.payload.helmChartMap;
      state.helmValuesMap = action.payload.helmValuesMap;
      state.previewLoader.isLoading = false;
      state.previewLoader.targetResourceId = undefined;
      state.selectedResourceId = undefined;
      state.selectedPath = undefined;
      state.previewResourceId = undefined;
      state.previewType = undefined;
      state.previewValuesFileId = undefined;
      state.previewLoader = {
        isLoading: false,
        targetResourceId: undefined,
      };
      state.diffResourceId = undefined;
      state.diffContent = undefined;
      state.isSelectingFile = false;
      state.isApplyingResource = false;
      state.clusterDiff = {
        hasLoaded: false,
        hasFailed: false,
        hideClusterOnlyResources: true,
        clusterToLocalResourcesMatches: [],
        diffResourceId: undefined,
        refreshDiffResource: undefined,
      };
      resetSelectionHistory(state);
    });

    builder.addCase(performResourceDiff.fulfilled, (state, action) => {
      state.diffResourceId = action.payload.diffResourceId;
      state.diffContent = action.payload.diffContent;
    });

    builder.addCase(selectFromHistory.fulfilled, (state, action) => {
      state.currentSelectionHistoryIndex = action.payload.nextSelectionHistoryIndex;
      state.selectionHistory = action.payload.newSelectionHistory;
    });

    builder.addCase(saveUnsavedResource.fulfilled, (state, action) => {
      const rootFolder = state.fileMap[ROOT_FILE_ENTRY].filePath;
      const resource = state.resourceMap[action.payload.resourceId];
      const relativeFilePath = action.payload.resourceFilePath.substr(rootFolder.length);
      const resourceFileEntry = state.fileMap[relativeFilePath];
      if (resource) {
        resource.filePath = relativeFilePath;
        resource.range = action.payload.resourceRange;
      }
      if (resourceFileEntry) {
        resourceFileEntry.timestamp = action.payload.fileTimestamp;
      } else {
        const newFileEntry = createFileEntry(relativeFilePath);
        newFileEntry.timestamp = action.payload.fileTimestamp;
        state.fileMap[relativeFilePath] = newFileEntry;
        const parentPath = path.join(path.sep, path.basename(path.dirname(relativeFilePath))).trim();
        const childFileName = path.basename(relativeFilePath);
        if (parentPath === path.sep) {
          const rootFileEntry = state.fileMap[ROOT_FILE_ENTRY];
          if (rootFileEntry.children) {
            rootFileEntry.children.push(childFileName);
            rootFileEntry.children.sort();
          } else {
            rootFileEntry.children = [childFileName];
          }
        } else {
          const parentPathFileEntry = state.fileMap[parentPath];
          if (parentPathFileEntry) {
            if (parentPathFileEntry.children !== undefined) {
              parentPathFileEntry.children.push(childFileName);
              parentPathFileEntry.children.sort();
            } else {
              parentPathFileEntry.children = [childFileName];
            }
          } else {
            log.warn(`[saveUnsavedResource]: Couldn't find parent path for ${relativeFilePath}`);
          }
        }
      }
    });

    builder
      .addCase(loadClusterDiff.pending, state => {
        state.clusterDiff.hasLoaded = false;
        state.clusterDiff.diffResourceId = undefined;
        state.clusterDiff.refreshDiffResource = undefined;
        state.clusterDiff.shouldReload = undefined;
      })
      .addCase(loadClusterDiff.rejected, state => {
        state.clusterDiff.hasLoaded = true;
        state.clusterDiff.hasFailed = true;
        state.clusterDiff.diffResourceId = undefined;
        state.clusterDiff.refreshDiffResource = undefined;
        state.clusterDiff.shouldReload = undefined;
      })
      .addCase(loadClusterDiff.fulfilled, (state, action) => {
        const clusterResourceMap = action.payload.resourceMap;
        if (!clusterResourceMap) {
          return;
        }

        const isInPreviewMode = Boolean(state.previewResourceId) || Boolean(state.previewValuesFileId);

        let localResources: K8sResource[] = [];
        localResources = Object.values(state.resourceMap).filter(
          resource =>
            !resource.filePath.startsWith(CLUSTER_DIFF_PREFIX) &&
            !resource.name.startsWith('Patch:') &&
            resource.kind !== KUSTOMIZATION_KIND
        );

        if (isInPreviewMode) {
          localResources = localResources.filter(resource => resource.filePath.startsWith(PREVIEW_PREFIX));
        }

        const groupedLocalResources = groupResourcesByIdentifier(
          localResources,
          makeResourceNameKindNamespaceIdentifier
        );

        // remove previous cluster diff resources
        Object.values(state.resourceMap)
          .filter(r => r.filePath.startsWith(CLUSTER_DIFF_PREFIX))
          .forEach(r => delete state.resourceMap[r.id]);
        // add resources from cluster diff to the resource map
        Object.values(clusterResourceMap).forEach(r => {
          state.resourceMap[r.id] = r;
        });

        const clusterResources = Object.values(clusterResourceMap);
        const groupedClusterResources = groupResourcesByIdentifier(
          clusterResources,
          makeResourceNameKindNamespaceIdentifier
        );

        let clusterToLocalResourcesMatches: ClusterToLocalResourcesMatch[] = [];
        const localResourceIdsAlreadyMatched: string[] = [];

        Object.entries(groupedClusterResources).forEach(([identifier, value]) => {
          const currentClusterResource = value[0];
          const matchingLocalResources = groupedLocalResources[identifier];
          if (!matchingLocalResources || matchingLocalResources.length === 0) {
            clusterToLocalResourcesMatches.push({
              clusterResourceId: currentClusterResource.id,
              resourceName: currentClusterResource.name,
              resourceKind: currentClusterResource.kind,
              resourceNamespace: currentClusterResource.namespace || 'default',
            });
          } else {
            const matchingLocalResourceIds = matchingLocalResources.map(r => r.id);
            clusterToLocalResourcesMatches.push({
              clusterResourceId: currentClusterResource.id,
              localResourceIds: matchingLocalResourceIds,
              resourceName: currentClusterResource.name,
              resourceKind: currentClusterResource.kind,
              resourceNamespace: currentClusterResource.namespace || 'default',
            });
            localResourceIdsAlreadyMatched.push(...matchingLocalResourceIds);
          }
        });

        if (state.clusterDiff.hideClusterOnlyResources) {
          clusterToLocalResourcesMatches = clusterToLocalResourcesMatches.filter(match => match.localResourceIds);
        }

        const localResourceIdentifiersNotMatched = [
          ...new Set(
            localResources
              .filter(r => !localResourceIdsAlreadyMatched.includes(r.id))
              .map(r => makeResourceNameKindNamespaceIdentifier(r))
          ),
        ];

        localResourceIdentifiersNotMatched.forEach(identifier => {
          const currentLocalResources = groupedLocalResources[identifier];
          if (!currentLocalResources || currentLocalResources.length === 0) {
            return;
          }
          clusterToLocalResourcesMatches.push({
            localResourceIds: currentLocalResources.map(r => r.id),
            resourceName: currentLocalResources[0].name,
            resourceKind: currentLocalResources[0].kind,
            resourceNamespace: currentLocalResources[0].namespace || 'default',
          });
        });

        state.clusterDiff.clusterToLocalResourcesMatches = clusterToLocalResourcesMatches;
        state.clusterDiff.hasLoaded = true;
        state.clusterDiff.hasFailed = false;
        state.clusterDiff.diffResourceId = undefined;
        state.clusterDiff.refreshDiffResource = undefined;
        state.clusterDiff.shouldReload = undefined;
      });

    builder.addCase(closeClusterDiff.type, state => {
      // remove previous cluster diff resources
      Object.values(state.resourceMap)
        .filter(r => r.filePath.startsWith(CLUSTER_DIFF_PREFIX))
        .forEach(r => delete state.resourceMap[r.id]);
      state.clusterDiff.clusterToLocalResourcesMatches = [];
      state.clusterDiff.hasLoaded = false;
      state.clusterDiff.hasFailed = false;
      state.clusterDiff.diffResourceId = undefined;
      state.clusterDiff.refreshDiffResource = undefined;
      state.clusterDiff.shouldReload = undefined;
    });

    builder.addMatcher(
      action => true,
      (state, action) => {
        if (action.payload?.alert) {
          const notification: AlertType = action.payload.alert;
          notification.id = uuidv4();
          notification.hasSeen = false;
          notification.createdAt = new Date().getTime();
          state.notifications = [notification, ...state.notifications];
        }
      }
    );
  },
});

function groupResourcesByIdentifier(
  resources: K8sResource[],
  makeIdentifier: (resource: K8sResource) => string
): Record<string, K8sResource[]> {
  const groupedResources: Record<string, K8sResource[]> = {};
  resources.forEach(resource => {
    const identifier = makeIdentifier(resource);
    if (groupedResources[identifier]) {
      groupedResources[identifier].push(resource);
    } else {
      groupedResources[identifier] = [resource];
    }
  });
  return groupedResources;
}

/**
 * Sets/clears preview resources
 */

function setPreviewData<State>(payload: SetPreviewDataPayload, state: AppState) {
  state.previewResourceId = undefined;
  state.previewValuesFileId = undefined;

  if (payload.previewResourceId) {
    if (state.previewType === 'kustomization') {
      if (state.resourceMap[payload.previewResourceId]) {
        state.previewResourceId = payload.previewResourceId;
      } else {
        log.error(`Unknown preview id: ${payload.previewResourceId}`);
      }
    }
    if (state.previewType === 'helm') {
      if (state.helmValuesMap[payload.previewResourceId]) {
        state.previewValuesFileId = payload.previewResourceId;
      } else {
        log.error(`Unknown preview id: ${payload.previewResourceId}`);
      }
    }
    if (state.previewType === 'cluster') {
      state.previewResourceId = payload.previewResourceId;
      state.previewKubeConfigPath = payload.previewKubeConfigPath;
      state.previewKubeConfigContext = payload.previewKubeConfigContext;
    }
  }

  // remove previous preview resources
  Object.values(state.resourceMap)
    .filter(r => r.filePath.startsWith(PREVIEW_PREFIX))
    .forEach(r => delete state.resourceMap[r.id]);

  if (payload.previewResourceId && payload.previewResources) {
    Object.values(payload.previewResources).forEach(r => {
      state.resourceMap[r.id] = r;
    });
  }
}

/**
 * Selects the specified filePath - used by several reducers
 */

function selectFilePath(filePath: string, state: AppState) {
  const entries = getAllFileEntriesForPath(filePath, state.fileMap);
  clearResourceSelections(state.resourceMap);

  if (entries.length > 0) {
    const parent = entries[entries.length - 1];
    getResourcesForPath(parent.filePath, state.resourceMap).forEach(r => {
      r.isHighlighted = true;
    });

    if (parent.children) {
      highlightChildrenResources(parent, state.resourceMap, state.fileMap);
    }

    Object.values(state.helmValuesMap).forEach(valuesFile => {
      valuesFile.isSelected = valuesFile.filePath === filePath;
    });
  }

  state.selectedResourceId = undefined;
  state.selectedPath = filePath;
}

export const {
  setAppRehydrating,
  addResource,
  selectK8sResource,
  selectFile,
  setSelectingFile,
  setApplyingResource,
  updateResource,
  updateFileEntry,
  pathAdded,
  multiplePathsAdded,
  fileChanged,
  multipleFilesChanged,
  pathRemoved,
  multiplePathsRemoved,
  selectHelmValuesFile,
  clearPreview,
  clearPreviewAndSelectionHistory,
  startPreviewLoader,
  stopPreviewLoader,
  removeResource,
  updateResourceFilter,
  addNotification,
  setDiffResourceInClusterDiff,
  setClusterDiffRefreshDiffResource,
} = mainSlice.actions;
export default mainSlice.reducer;
