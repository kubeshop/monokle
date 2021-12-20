// eslint-disable-next-line
import * as k8s from '@kubernetes/client-node';

import {Draft, PayloadAction, createAsyncThunk, createSlice, original} from '@reduxjs/toolkit';

import fs from 'fs';
import log from 'loglevel';
import path from 'path';
import {v4 as uuidv4} from 'uuid';
import {parseDocument} from 'yaml';

import {CLUSTER_DIFF_PREFIX, KUSTOMIZATION_KIND, PREVIEW_PREFIX, ROOT_FILE_ENTRY} from '@constants/constants';

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
  SelectionHistoryEntry,
} from '@models/appstate';
import {K8sResource} from '@models/k8sresource';
import {MonoklePlugin} from '@models/plugin';

import {findResourcesToReprocess, updateReferringRefsOnDelete} from '@redux/services/resourceRefs';
import {resetSelectionHistory} from '@redux/services/selectionHistory';
import {performResourceDiff} from '@redux/thunks/diffResource';
import {loadClusterDiff} from '@redux/thunks/loadClusterDiff';
import {previewCluster, repreviewCluster} from '@redux/thunks/previewCluster';
import {previewHelmValuesFile} from '@redux/thunks/previewHelmValuesFile';
import {previewKustomization} from '@redux/thunks/previewKustomization';
import {replaceSelectedResourceMatches} from '@redux/thunks/replaceSelectedResourceMatches';
import {saveUnsavedResource} from '@redux/thunks/saveUnsavedResource';
import {setRootFolder} from '@redux/thunks/setRootFolder';

import electronStore from '@utils/electronStore';
import {getFileStats, getFileTimestamp} from '@utils/files';
import {makeResourceNameKindNamespaceIdentifier} from '@utils/resources';

import {getKnownResourceKinds, getResourceKindHandler} from '@src/kindhandlers';

import initialState from '../initialState';
import {
  addPath,
  createFileEntry,
  getFileEntryForAbsolutePath,
  getResourcesForPath,
  reloadFile,
  removePath,
  selectFilePath,
} from '../services/fileEntry';
import {
  deleteResource,
  extractK8sResources,
  getResourceKindsWithTargetingRefs,
  isFileResource,
  isUnsavedResource,
  processParsedResources,
  recalculateResourceRanges,
  removeResourceFromFile,
  reprocessResources,
  saveResource,
} from '../services/resource';
import {clearResourceSelections, updateSelectionAndHighlights} from '../services/selection';
import {setAlert} from './alert';
import {closeClusterDiff} from './ui';

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

export type UpdateManyResourcesPayload = {
  resourceId: string;
  content: string;
}[];

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

const performResourceContentUpdate = (state: AppState, resource: K8sResource, newText: string) => {
  if (isFileResource(resource)) {
    const updatedFileText = saveResource(resource, newText, state.fileMap);
    resource.text = updatedFileText;
    resource.content = parseDocument(updatedFileText).toJS();
    recalculateResourceRanges(resource, state);
  } else {
    resource.text = newText;
    resource.content = parseDocument(newText).toJS();
  }
};

export const updateShouldOptionalIgnoreUnsatisfiedRefs = createAsyncThunk(
  'main/resourceRefsProcessingOptions/shouldIgnoreOptionalUnsatisfiedRefs',
  async (shouldIgnore: boolean, thunkAPI) => {
    electronStore.set('main.resourceRefsProcessingOptions.shouldIgnoreOptionalUnsatisfiedRefs', shouldIgnore);
    thunkAPI.dispatch(mainSlice.actions.setShouldIgnoreOptionalUnsatisfiedRefs(shouldIgnore));
    thunkAPI.dispatch(mainSlice.actions.reprocessResourcesForOptionalLinks());
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

/**
 * Returns a resourceMap containing only active resources depending if we are in preview mode
 */

function getActiveResources(state: Draft<AppState>) {
  if (state.previewResourceId || state.previewValuesFileId) {
    let activeResources: ResourceMapType = {};
    Object.values(state.resourceMap)
      .filter(r => r.filePath.startsWith(PREVIEW_PREFIX))
      .forEach(r => {
        activeResources[r.id] = r;
      });

    return activeResources;
  }
  return state.resourceMap;
}

/**
 * The main reducer slice
 */

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
            fileEntry.timestamp = getFileTimestamp(filePath);

            getResourcesForPath(fileEntry.filePath, state.resourceMap).forEach(r => {
              deleteResource(r, state.resourceMap);
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
     * Reprocess all resources - called when changing processing-related options
     */
    reprocessResourcesForOptionalLinks: (state: Draft<AppState>) => {
      // find all resourceKinds with optional refmappers
      const resourceKindsWithOptionalRefs = getKnownResourceKinds().filter(kind => {
        const handler = getResourceKindHandler(kind);
        if (handler && handler.outgoingRefMappers) {
          return handler.outgoingRefMappers.some(mapper => mapper.source.hasOptionalSibling);
        }
        return false;
      });

      processParsedResources(getActiveResources(state), state.resourceRefsProcessingOptions, {
        resourceKinds: resourceKindsWithOptionalRefs,
        skipValidation: true,
      });
    },
    /**
     * Reprocess a newly created resource
     */
    reprocessNewResource: (state: Draft<AppState>, action: PayloadAction<K8sResource>) => {
      const resource = action.payload;
      const resourceKinds = getResourceKindsWithTargetingRefs(resource);

      processParsedResources(getActiveResources(state), state.resourceRefsProcessingOptions, {
        resourceIds: [resource.id],
        resourceKinds,
      });
    },
    /**
    /**
     * Updates the content of the specified resource to the specified value
     */
    updateResource: (state: Draft<AppState>, action: PayloadAction<UpdateResourcePayload>) => {
      try {
        const activeResources = getActiveResources(state);
        const resource = activeResources[action.payload.resourceId];
        if (resource) {
          performResourceContentUpdate(state, resource, action.payload.content);
          let resourceIds = findResourcesToReprocess(resource, activeResources);
          reprocessResources(resourceIds, activeResources, state.fileMap, state.resourceRefsProcessingOptions);
          if (!action.payload.preventSelectionAndHighlightsUpdate) {
            resource.isSelected = false;
            updateSelectionAndHighlights(state, resource);
          }
        } else {
          console.warn('Failed to find updated resource in active resources');
        }
      } catch (e) {
        log.error(e);
        return original(state);
      }
    },
    /**
     * Updates the content of the specified resources to the specified values
     */
    updateManyResources: (state: Draft<AppState>, action: PayloadAction<UpdateManyResourcesPayload>) => {
      try {
        let resourceIdsToReprocess: string[] = [];
        const activeResources = getActiveResources(state);

        action.payload.forEach(({resourceId, content}) => {
          const resource = activeResources[resourceId];
          if (resource) {
            performResourceContentUpdate(state, resource, content);
            let resourceIds = findResourcesToReprocess(resource, state.resourceMap);
            resourceIdsToReprocess = [...new Set(resourceIdsToReprocess.concat(...resourceIds))];
          }
        });
        reprocessResources(resourceIdsToReprocess, activeResources, state.fileMap, state.resourceRefsProcessingOptions);
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

      updateReferringRefsOnDelete(resource, state.resourceMap);

      if (state.selectedResourceId === resourceId) {
        clearResourceSelections(state.resourceMap);
        state.selectedResourceId = undefined;
      }
      if (isUnsavedResource(resource)) {
        deleteResource(resource, state.resourceMap);
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
            deleteResource(resource, state.resourceMap);
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
    extendResourceFilter: (state: Draft<AppState>, action: PayloadAction<ResourceFilterType>) => {
      const filter = action.payload;

      // construct new filter
      let newFilter: ResourceFilterType = {
        namespace: filter.namespace
          ? filter.namespace === state.resourceFilter.namespace
            ? undefined
            : filter.namespace
          : state.resourceFilter.namespace,
        kind: filter.kind
          ? filter.kind === state.resourceFilter.kind
            ? undefined
            : filter.kind
          : state.resourceFilter.kind,
        name: state.resourceFilter.name,
        labels: state.resourceFilter.labels,
        annotations: state.resourceFilter.annotations,
      };

      Object.keys(filter.labels).forEach(key => {
        if (newFilter.labels[key] === filter.labels[key]) {
          delete newFilter.labels[key];
        } else {
          newFilter.labels[key] = filter.labels[key];
        }
      });
      Object.keys(filter.annotations).forEach(key => {
        if (newFilter.annotations[key] === filter.annotations[key]) {
          delete newFilter.annotations[key];
        } else {
          newFilter.annotations[key] = filter.annotations[key];
        }
      });
      state.resourceFilter = newFilter;
    },
    setShouldIgnoreOptionalUnsatisfiedRefs: (state: Draft<AppState>, action: PayloadAction<boolean>) => {
      state.resourceRefsProcessingOptions.shouldIgnoreOptionalUnsatisfiedRefs = action.payload;
    },
    setDiffResourceInClusterDiff: (state: Draft<AppState>, action: PayloadAction<string | undefined>) => {
      state.clusterDiff.diffResourceId = action.payload;
    },
    setClusterDiffRefreshDiffResource: (state: Draft<AppState>, action: PayloadAction<boolean | undefined>) => {
      state.clusterDiff.refreshDiffResource = action.payload;
    },
    selectClusterDiffMatch: (state: Draft<AppState>, action: PayloadAction<string>) => {
      const matchId = action.payload;
      if (!state.clusterDiff.selectedMatches.includes(matchId)) {
        state.clusterDiff.selectedMatches.push(matchId);
      }
    },
    selectAllClusterDiffMatches: (state: Draft<AppState>) => {
      state.clusterDiff.selectedMatches = state.clusterDiff.clusterToLocalResourcesMatches.map(match =>
        makeResourceNameKindNamespaceIdentifier({
          name: match.resourceName,
          kind: match.resourceKind,
          namespace: match.resourceNamespace,
        })
      );
    },
    unselectClusterDiffMatch: (state: Draft<AppState>, action: PayloadAction<string>) => {
      const matchId = action.payload;
      if (state.clusterDiff.selectedMatches.includes(matchId)) {
        state.clusterDiff.selectedMatches = state.clusterDiff.selectedMatches.filter(m => m !== matchId);
      }
    },
    unselectAllClusterDiffMatches: (state: Draft<AppState>) => {
      state.clusterDiff.selectedMatches = [];
    },
    reloadClusterDiff: (state: Draft<AppState>) => {
      state.clusterDiff.shouldReload = true;
    },
    setSelectionHistory: (
      state: Draft<AppState>,
      action: PayloadAction<{nextSelectionHistoryIndex?: number; newSelectionHistory: SelectionHistoryEntry[]}>
    ) => {
      state.currentSelectionHistoryIndex = action.payload.nextSelectionHistoryIndex;
      state.selectionHistory = action.payload.newSelectionHistory;
    },
    editorHasReloadedSelectedPath: (state: Draft<AppState>) => {
      state.shouldEditorReloadSelectedPath = false;
    },
    checkResourceId: (state: Draft<AppState>, action: PayloadAction<string>) => {
      if (!state.checkedResourceIds.includes(action.payload)) {
        state.checkedResourceIds.push(action.payload);
      }
    },
    uncheckResourceId: (state: Draft<AppState>, action: PayloadAction<string>) => {
      state.checkedResourceIds = state.checkedResourceIds.filter(resourceId => action.payload !== resourceId);
    },
    checkMultipleResourceIds: (state: Draft<AppState>, action: PayloadAction<string[]>) => {
      action.payload.forEach(resourceId => {
        if (!state.checkedResourceIds.includes(resourceId)) {
          state.checkedResourceIds.push(resourceId);
        }
      });
    },
    uncheckAllResourceIds: (state: Draft<AppState>) => {
      state.checkedResourceIds = [];
    },
    uncheckMultipleResourceIds: (state: Draft<AppState>, action: PayloadAction<string[]>) => {
      state.checkedResourceIds = state.checkedResourceIds.filter(resourceId => !action.payload.includes(resourceId));
    },
    addPlugin: (state: Draft<AppState>, action: PayloadAction<MonoklePlugin>) => {
      state.plugins.push(action.payload);
    },
    setPlugins: (state: Draft<AppState>, action: PayloadAction<MonoklePlugin[]>) => {
      state.plugins = action.payload;
    },
    clusterDiffToggleClusterOnlyResources: (state: Draft<AppState>) => {
      state.clusterDiff.hideClusterOnlyResources = !state.clusterDiff.hideClusterOnlyResources;
    },
  },
  extraReducers: builder => {
    builder.addCase(setAlert, (state, action) => {
      const notification: AlertType = action.payload;
      notification.id = uuidv4();
      notification.hasSeen = false;
      notification.createdAt = new Date().getTime();
      state.notifications = [notification, ...state.notifications];
    });

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
        state.checkedResourceIds = [];
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
        state.checkedResourceIds = [];
        if (action.payload.previewResourceId && state.helmValuesMap[action.payload.previewResourceId]) {
          selectFilePath(state.helmValuesMap[action.payload.previewResourceId].filePath, state);
        }
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
        state.selectedPath = undefined;
        state.selectedValuesFileId = undefined;
        state.checkedResourceIds = [];
        Object.values(state.resourceMap).forEach(resource => {
          resource.isSelected = false;
          resource.isHighlighted = false;
        });
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
      state.checkedResourceIds = [];
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
        selectedMatches: [],
      };
      resetSelectionHistory(state);
    });

    builder.addCase(performResourceDiff.fulfilled, (state, action) => {
      state.diffResourceId = action.payload.diffResourceId;
      state.diffContent = action.payload.diffContent;
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
        const childFileName = path.basename(relativeFilePath);
        const parentPath = path.join(path.sep, relativeFilePath.replace(`${path.sep}${childFileName}`, '')).trim();
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
        state.clusterDiff.selectedMatches = [];
      })
      .addCase(loadClusterDiff.rejected, state => {
        state.clusterDiff.hasLoaded = true;
        state.clusterDiff.hasFailed = true;
        state.clusterDiff.diffResourceId = undefined;
        state.clusterDiff.refreshDiffResource = undefined;
        state.clusterDiff.shouldReload = undefined;
        state.clusterDiff.selectedMatches = [];
      })
      .addCase(loadClusterDiff.fulfilled, (state, action) => {
        const clusterResourceMap = action.payload.resourceMap;
        if (!clusterResourceMap) {
          return;
        }

        const isInPreviewMode = Boolean(state.previewResourceId) || Boolean(state.previewValuesFileId);

        // get the local resources from state.resourceMap
        let localResources: K8sResource[] = [];
        localResources = Object.values(state.resourceMap).filter(
          resource =>
            !resource.filePath.startsWith(CLUSTER_DIFF_PREFIX) &&
            !resource.name.startsWith('Patch:') &&
            resource.kind !== KUSTOMIZATION_KIND
        );

        // if we are in preview mode, localResources must contain only the preview resources
        if (isInPreviewMode) {
          localResources = localResources.filter(resource => resource.filePath.startsWith(PREVIEW_PREFIX));
        }

        // this groups local resources by {name}{kind}{namespace}
        const groupedLocalResources = groupResourcesByIdentifier(
          localResources,
          makeResourceNameKindNamespaceIdentifier
        );

        // remove previous cluster diff resources
        Object.values(state.resourceMap)
          .filter(r => r.filePath.startsWith(CLUSTER_DIFF_PREFIX))
          .forEach(r => deleteResource(r, state.resourceMap));
        // add resources from cluster diff to the resource map
        Object.values(clusterResourceMap).forEach(r => {
          // add prefix to the resource id to avoid replacing local resources that might have the same id
          // this happens only if the local resource has it's metadata.uid defined
          const clusterResourceId = `${CLUSTER_DIFF_PREFIX}${r.id}`;
          r.id = clusterResourceId;
          state.resourceMap[clusterResourceId] = r;
        });

        const clusterResources = Object.values(clusterResourceMap);
        // this groups cluster resources by {name}{kind}{namespace}
        // it's purpose is to allow us to find matches in the groupedLocalResources Record using the identifier
        const groupedClusterResources = groupResourcesByIdentifier(
          clusterResources,
          makeResourceNameKindNamespaceIdentifier
        );

        let clusterToLocalResourcesMatches: ClusterToLocalResourcesMatch[] = [];
        // this keeps track of local resources that have already been matched
        const localResourceIdsAlreadyMatched: string[] = [];

        Object.entries(groupedClusterResources).forEach(([identifier, value]) => {
          // the value should always be an array of length 1 so we take the first entry
          const currentClusterResource = value[0];
          const matchingLocalResources = groupedLocalResources[identifier];
          if (!matchingLocalResources || matchingLocalResources.length === 0) {
            // if there are no matching resources, we create a cluster only match
            clusterToLocalResourcesMatches.push({
              id: identifier,
              clusterResourceId: currentClusterResource.id,
              resourceName: currentClusterResource.name,
              resourceKind: currentClusterResource.kind,
              resourceNamespace: currentClusterResource.namespace || 'default',
            });
          } else {
            const matchingLocalResourceIds = matchingLocalResources.map(r => r.id);
            clusterToLocalResourcesMatches.push({
              id: identifier,
              localResourceIds: matchingLocalResourceIds,
              clusterResourceId: currentClusterResource.id,
              resourceName: currentClusterResource.name,
              resourceKind: currentClusterResource.kind,
              resourceNamespace: currentClusterResource.namespace || 'default',
            });
            localResourceIdsAlreadyMatched.push(...matchingLocalResourceIds);
          }
        });

        // optionally filter out all the cluster only matches
        if (state.clusterDiff.hideClusterOnlyResources) {
          clusterToLocalResourcesMatches = clusterToLocalResourcesMatches.filter(match => match.localResourceIds);
        }

        // remove deduplicates if there are any
        const localResourceIdentifiersNotMatched = [
          ...new Set(
            localResources
              .filter(r => !localResourceIdsAlreadyMatched.includes(r.id))
              .map(r => makeResourceNameKindNamespaceIdentifier(r))
          ),
        ];

        // create local only matches
        localResourceIdentifiersNotMatched.forEach(identifier => {
          const currentLocalResources = groupedLocalResources[identifier];
          if (!currentLocalResources || currentLocalResources.length === 0) {
            return;
          }
          clusterToLocalResourcesMatches.push({
            id: identifier,
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
        state.clusterDiff.selectedMatches = [];
      });

    builder.addCase(closeClusterDiff.type, state => {
      // remove previous cluster diff resources
      Object.values(state.resourceMap)
        .filter(r => r.filePath.startsWith(CLUSTER_DIFF_PREFIX))
        .forEach(r => deleteResource(r, state.resourceMap));
      state.clusterDiff.clusterToLocalResourcesMatches = [];
      state.clusterDiff.hasLoaded = false;
      state.clusterDiff.hasFailed = false;
      state.clusterDiff.diffResourceId = undefined;
      state.clusterDiff.refreshDiffResource = undefined;
      state.clusterDiff.shouldReload = undefined;
      state.clusterDiff.selectedMatches = [];
    });

    builder
      .addCase(replaceSelectedResourceMatches.pending, state => {
        state.clusterDiff.hasLoaded = false;
      })
      .addCase(replaceSelectedResourceMatches.fulfilled, state => {
        state.clusterDiff.hasLoaded = true;
      })
      .addCase(replaceSelectedResourceMatches.rejected, state => {
        state.clusterDiff.hasLoaded = true;
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
    .forEach(r => deleteResource(r, state.resourceMap));

  if (payload.previewResourceId && payload.previewResources) {
    Object.values(payload.previewResources).forEach(r => {
      state.resourceMap[r.id] = r;
    });
  }
}

export const {
  setAppRehydrating,
  addResource,
  selectK8sResource,
  selectFile,
  setSelectingFile,
  setApplyingResource,
  updateResource,
  updateManyResources,
  updateFileEntry,
  multiplePathsAdded,
  multipleFilesChanged,
  multiplePathsRemoved,
  selectHelmValuesFile,
  clearPreview,
  clearPreviewAndSelectionHistory,
  startPreviewLoader,
  stopPreviewLoader,
  removeResource,
  updateResourceFilter,
  extendResourceFilter,
  setDiffResourceInClusterDiff,
  setClusterDiffRefreshDiffResource,
  selectClusterDiffMatch,
  selectAllClusterDiffMatches,
  unselectClusterDiffMatch,
  unselectAllClusterDiffMatches,
  reloadClusterDiff,
  clusterDiffToggleClusterOnlyResources,
  setSelectionHistory,
  reprocessNewResource,
  editorHasReloadedSelectedPath,
  checkResourceId,
  uncheckAllResourceIds,
  uncheckResourceId,
  checkMultipleResourceIds,
  uncheckMultipleResourceIds,
  addPlugin,
  setPlugins,
} = mainSlice.actions;
export default mainSlice.reducer;
