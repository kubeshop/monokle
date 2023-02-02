import {Draft, PayloadAction, createSlice} from '@reduxjs/toolkit';

import {isEqual} from 'lodash';
import log from 'loglevel';
import path from 'path';
import {v4 as uuidv4} from 'uuid';

import initialState from '@redux/initialState';
import {setAlert} from '@redux/reducers/alert';
import {resourceContentMapSelector, resourceMetaMapSelector} from '@redux/selectors/resourceMapSelectors';
import {createFileEntry, getFileEntryForAbsolutePath, removePath} from '@redux/services/fileEntry';
import {HelmChartEventEmitter} from '@redux/services/helm';
import {joinK8sResource, saveResource, splitK8sResource, splitK8sResourceMap} from '@redux/services/resource';
import {resetSelectionHistory} from '@redux/services/selectionHistory';
import {loadClusterResources, reloadClusterResources, stopClusterConnection} from '@redux/thunks/cluster';
import {multiplePathsAdded} from '@redux/thunks/multiplePathsAdded';
import {multiplePathsChanged} from '@redux/thunks/multiplePathsChanged';
import {removeResources} from '@redux/thunks/removeResources';
import {saveTransientResources} from '@redux/thunks/saveTransientResources';
import {setRootFolder} from '@redux/thunks/setRootFolder';
import {updateFileEntry} from '@redux/thunks/updateFileEntry';
import {updateMultipleResources} from '@redux/thunks/updateMultipleResources';
import {updateResource} from '@redux/thunks/updateResource';
import {processResourceRefs} from '@redux/validation/validation.thunks';

import {parseYamlDocument} from '@utils/yaml';

import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {AlertType} from '@shared/models/alert';
import {
  AppState,
  FileMapType,
  HelmChartMapType,
  HelmTemplatesMapType,
  HelmValuesMapType,
  MatchParamProps,
} from '@shared/models/appState';
import {ProjectConfig} from '@shared/models/config';
import {CurrentMatch, FileEntry} from '@shared/models/fileEntry';
import {HelmChart} from '@shared/models/helm';
import {ValidationIntegration} from '@shared/models/integrations';
import {
  K8sResource,
  ResourceContentMap,
  ResourceIdentifier,
  ResourceMetaMap,
  isClusterResource,
  isLocalResource,
} from '@shared/models/k8sResource';
import {PreviewType} from '@shared/models/preview';
import {RootState} from '@shared/models/rootState';
import {AppSelection} from '@shared/models/selection';
import electronStore from '@shared/utils/electronStore';
import {trackEvent} from '@shared/utils/telemetry';

import {filterReducers} from './filterReducers';
import {imageReducers} from './imageReducers';
import {clearPreviewReducer, previewExtraReducers, previewReducers} from './previewReducers';
import {clearSelectionReducer, selectionReducers} from './selectionReducers';

export type SetRootFolderPayload = {
  projectConfig: ProjectConfig;
  fileMap: FileMapType;
  resourceMetaMap: ResourceMetaMap<'local'>;
  resourceContentMap: ResourceContentMap<'local'>;
  helmChartMap: HelmChartMapType;
  helmValuesMap: HelmValuesMapType;
  helmTemplatesMap: HelmTemplatesMapType;
  alert?: AlertType;
  isScanExcludesUpdated: 'outdated' | 'applied';
  isScanIncludesUpdated: 'outdated' | 'applied';
  isGitRepo: boolean;
};

export type UpdateMultipleResourcesPayload = {
  resourceId: string;
  content: string;
}[];

export type UpdateFileEntryPayload = {
  path: string;
  text: string;
};

export type UpdateFilesEntryPayload = {
  pathes: {relativePath: string; absolutePath: string}[];
};

export type SetPreviewDataPayload = {
  // TODO: probably need to add info about what type of preview this is and what was it's source (helm chart id, kustomization id, etc)
  previewResourceMetaMap?: ResourceMetaMap<'preview'>;
  previewResourceContentMap?: ResourceContentMap<'preview'>;
  alert?: AlertType;
  previewKubeConfigPath?: string;
  previewKubeConfigContext?: string;
};

export type SetDiffDataPayload = {
  diffResourceId?: string;
  diffContent?: string;
};

export type StartPreviewLoaderPayload = {
  targetId: string;
  previewType: PreviewType;
};

export const performResourceContentUpdate = (resource: K8sResource, newText: string, fileMap: FileMapType) => {
  if (isLocalResource(resource)) {
    const updatedFileText = saveResource(resource, newText, fileMap);
    resource.text = updatedFileText;
    resource.object = parseYamlDocument(updatedFileText).toJS();
  } else {
    resource.text = newText;
    resource.object = parseYamlDocument(newText).toJS();
  }
};

// TODO: @monokle/validation - use the shouldIgnoreOptionalUnsatisfiedRefs setting and reprocess all refs
// export const updateShouldOptionalIgnoreUnsatisfiedRefs = createAsyncThunk<AppState, boolean, ThunkApi>(
//   'main/resourceRefsProcessingOptions/shouldIgnoreOptionalUnsatisfiedRefs',
//   async (shouldIgnore, thunkAPI) => {}
// );

/**
 * The main reducer slice
 */

const addResourceReducer = (state: AppState, resource: K8sResource) => {
  const {meta, content} = splitK8sResource(resource);
  // TODO: how can we fix the types here?
  // @ts-ignore
  state.resourceMetaMapByStorage[meta.origin.storage] = meta;
  // @ts-ignore
  state.resourceContentMapByStorage[content.origin.storage] = content;
};

export const mainSlice = createSlice({
  name: 'main',
  initialState: initialState.main,
  reducers: {
    ...selectionReducers,
    ...previewReducers,
    ...filterReducers,
    ...imageReducers,
    addResource(state: Draft<AppState>, action: PayloadAction<K8sResource>) {
      addResourceReducer(state, action.payload);
    },
    addMultipleResources(state: Draft<AppState>, action: PayloadAction<K8sResource[]>) {
      action.payload.forEach(resource => {
        addResourceReducer(state, resource);
      });
    },
    setAppRehydrating: (state: Draft<AppState>, action: PayloadAction<boolean>) => {
      state.isRehydrating = action.payload;
      if (!action.payload) {
        state.wasRehydrated = !action.payload;
      }
    },
    setAutosavingError: (state: Draft<AppState>, action: PayloadAction<any>) => {
      state.autosaving.error = action.payload;
    },
    setAutosavingStatus: (state: Draft<AppState>, action: PayloadAction<boolean>) => {
      state.autosaving.status = action.payload;
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
        }
      });
    },

    updateSearchQuery: (state: Draft<AppState>, action: PayloadAction<string>) => {
      state.search.searchQuery = action.payload;
    },
    updateReplaceQuery: (state: Draft<AppState>, action: PayloadAction<string>) => {
      state.search.replaceQuery = action.payload;
    },
    toggleMatchParams: (state: Draft<AppState>, action: PayloadAction<keyof MatchParamProps>) => {
      const param = action.payload;
      state.search.queryMatchParams = {
        ...state.search.queryMatchParams,
        [param]: !state.search.queryMatchParams[param],
      };
    },
    highlightFileMatches: (state: Draft<AppState>, action: PayloadAction<CurrentMatch | null>) => {
      state.search.currentMatch = action.payload;
    },
    setSelectionHistory: (
      state: Draft<AppState>,
      action: PayloadAction<{nextSelectionHistoryIndex?: number; newSelectionHistory: AppSelection[]}>
    ) => {
      state.selectionHistory.index = action.payload.nextSelectionHistoryIndex;
      state.selectionHistory.current = action.payload.newSelectionHistory;
    },
    editorHasReloadedSelectedPath: (state: Draft<AppState>, action: PayloadAction<boolean>) => {
      // TODO: why is shouldEditorReload needed?
      state.selectionOptions.shouldEditorReload = action.payload;
    },
    checkResourceId: (state: Draft<AppState>, action: PayloadAction<ResourceIdentifier>) => {
      if (!state.checkedResourceIdentifiers.includes(action.payload)) {
        state.checkedResourceIdentifiers.push(action.payload);
      }
    },
    uncheckResourceId: (state: Draft<AppState>, action: PayloadAction<ResourceIdentifier>) => {
      state.checkedResourceIdentifiers = state.checkedResourceIdentifiers.filter(
        resourceId => !isEqual(action.payload, resourceId)
      );
    },
    checkMultipleResourceIds: (state: Draft<AppState>, action: PayloadAction<ResourceIdentifier[]>) => {
      action.payload.forEach(resourceId => {
        if (!state.checkedResourceIdentifiers.find(r => isEqual(r, resourceId))) {
          state.checkedResourceIdentifiers.push(resourceId);
        }
      });
    },
    uncheckAllResourceIds: (state: Draft<AppState>) => {
      state.checkedResourceIdentifiers = [];
    },
    uncheckMultipleResourceIds: (state: Draft<AppState>, action: PayloadAction<ResourceIdentifier[]>) => {
      state.checkedResourceIdentifiers = state.checkedResourceIdentifiers.filter(
        resourceId => !action.payload.find(r => isEqual(r, resourceId))
      );
    },
    openResourceDiffModal: (state: Draft<AppState>, action: PayloadAction<string>) => {
      trackEvent('cluster/diff_resource');
      state.resourceDiff.targetResourceId = action.payload;
    },
    closeResourceDiffModal: (state: Draft<AppState>) => {
      state.resourceDiff.targetResourceId = undefined;
    },
    addMultipleKindHandlers: (state: Draft<AppState>, action: PayloadAction<string[]>) => {
      action.payload.forEach(kind => {
        if (!state.registeredKindHandlers.includes(kind)) {
          state.registeredKindHandlers.push(kind);
        }
      });
    },
    addKindHandler: (state: Draft<AppState>, action: PayloadAction<string>) => {
      if (!state.registeredKindHandlers.includes(action.payload)) {
        state.registeredKindHandlers.push(action.payload);
      }
    },
    seenNotifications: (state: Draft<AppState>) => {
      state.notifications.forEach(notification => {
        notification.hasSeen = true;
      });
    },
    clearNotifications: (state: Draft<AppState>) => {
      state.notifications = [];
    },
    openPreviewConfigurationEditor: (
      state: Draft<AppState>,
      action: PayloadAction<{helmChartId: string; previewConfigurationId?: string}>
    ) => {
      const {helmChartId, previewConfigurationId} = action.payload;
      state.prevConfEditor = {
        helmChartId,
        previewConfigurationId,
        isOpen: true,
      };
    },
    closePreviewConfigurationEditor: (state: Draft<AppState>) => {
      state.prevConfEditor = {
        isOpen: false,
        helmChartId: undefined,
        previewConfigurationId: undefined,
      };
    },

    setLastChangedLine: (state: Draft<AppState>, action: PayloadAction<number>) => {
      state.lastChangedLine = action.payload;
    },

    updateValidationIntegration: (state: Draft<AppState>, action: PayloadAction<ValidationIntegration | undefined>) => {
      state.validationIntegration = action.payload;
    },
    updateSearchHistory: (state: Draft<AppState>, action: PayloadAction<string>) => {
      let newSearchHistory: string[] = [...state.search.searchHistory];
      if (state.search.searchHistory.length >= 5) {
        newSearchHistory.shift();
      }
      electronStore.set('appConfig.recentSearch', [...newSearchHistory, action.payload]);
      state.search.searchHistory = [...newSearchHistory, action.payload];
    },
    updateMultipleClusterResources: (state: Draft<AppState>, action: PayloadAction<K8sResource[]>) => {
      action.payload.forEach((r: K8sResource) => {
        if (!isClusterResource(r)) {
          return;
        }
        const {meta, content} = splitK8sResource(r);
        state.resourceMetaMapByStorage.cluster[r.id] = meta;
        state.resourceContentMapByStorage.cluster[r.id] = content;
      });
    },
    deleteMultipleClusterResources: (state: Draft<AppState>, action: PayloadAction<K8sResource[]>) => {
      action.payload.forEach((r: K8sResource) => {
        delete state.resourceMetaMapByStorage.cluster[r.id];
        delete state.resourceContentMapByStorage.cluster[r.id];
      });
    },
  },
  extraReducers: builder => {
    builder.addCase(setAlert, (state, action) => {
      const notification: AlertType = {
        ...action.payload,
        id: uuidv4(),
        hasSeen: false,
        createdAt: new Date().getTime(),
      };

      state.notifications = [notification, ...state.notifications];
    });

    previewExtraReducers(builder);

    builder
      .addCase(loadClusterResources.pending, state => {
        // TODO: should we set the context of the cluster connection here?
        state.clusterConnectionOptions.isLoading = true;
      })
      .addCase(loadClusterResources.fulfilled, (state, action) => {
        state.clusterConnectionOptions.isLoading = false;
        resetSelectionHistory(state);
        clearSelectionReducer(state);
        state.checkedResourceIdentifiers = [];

        const {metaMap, contentMap} = splitK8sResourceMap(action.payload.resources);

        state.resourceMetaMapByStorage.cluster = metaMap;
        state.resourceContentMapByStorage.cluster = contentMap;
        state.clusterConnection = {
          context: action.payload.context,
          namespace: action.payload.namespace,
          kubeConfigPath: action.payload.kubeConfigPath,
        };
        state.clusterConnectionOptions.lastNamespaceLoaded = action.payload.namespace;
        electronStore.set('appConfig.lastNamespaceLoaded', action.payload.namespace);
      })
      .addCase(loadClusterResources.rejected, state => {
        state.clusterConnectionOptions.isLoading = false;
        state.clusterConnection = undefined;
      });

    builder
      .addCase(reloadClusterResources.pending, state => {
        state.clusterConnectionOptions.isLoading = true;
      })
      .addCase(reloadClusterResources.fulfilled, (state, action) => {
        state.clusterConnectionOptions.isLoading = false;
        state.checkedResourceIdentifiers = [];

        if (
          state.selection?.type === 'resource' &&
          state.selection.resourceIdentifier.storage === 'cluster' &&
          !state.resourceMetaMapByStorage.cluster[state.selection.resourceIdentifier.id]
        ) {
          clearSelectionReducer(state);
        }

        const {metaMap, contentMap} = splitK8sResourceMap(action.payload.resources);

        state.resourceMetaMapByStorage.cluster = metaMap;
        state.resourceContentMapByStorage.cluster = contentMap;
        state.clusterConnection = {
          context: action.payload.context,
          namespace: action.payload.namespace,
          kubeConfigPath: action.payload.kubeConfigPath,
        };
        state.clusterConnectionOptions.lastNamespaceLoaded = action.payload.namespace;
        electronStore.set('appConfig.lastNamespaceLoaded', action.payload.namespace);
      })
      .addCase(reloadClusterResources.rejected, state => {
        state.clusterConnectionOptions.isLoading = false;
        state.clusterConnection = undefined;
      });

    builder.addCase(stopClusterConnection.fulfilled, state => {
      resetSelectionHistory(state);
      state.clusterConnectionOptions.isLoading = false;
      state.clusterConnection = undefined;
    });

    builder.addCase(setRootFolder.pending, state => {
      const existingHelmCharts: HelmChart[] = JSON.parse(JSON.stringify(Object.values(state.helmChartMap)));
      if (existingHelmCharts.length) {
        setImmediate(() => existingHelmCharts.forEach(chart => HelmChartEventEmitter.emit('remove', chart.id)));
      }
    });

    builder.addCase(setRootFolder.fulfilled, (state, action) => {
      state.resourceMetaMapByStorage.local = action.payload.resourceMetaMap;
      state.resourceContentMapByStorage.local = action.payload.resourceContentMap;
      state.fileMap = action.payload.fileMap;
      state.helmChartMap = action.payload.helmChartMap;
      state.helmValuesMap = action.payload.helmValuesMap;
      state.helmTemplatesMap = action.payload.helmTemplatesMap;

      clearSelectionReducer(state);
      clearPreviewReducer(state);
      resetSelectionHistory(state);
      state.checkedResourceIdentifiers = [];
      state.isApplyingResource = false;
      state.resourceDiff = {
        targetResourceId: undefined,
      };
      state.resourceFilter = {
        labels: {},
        annotations: {},
      };
    });

    builder.addCase(saveTransientResources.fulfilled, (state, action) => {
      const rootFolder = state.fileMap[ROOT_FILE_ENTRY].filePath;

      action.payload.resourcePayloads.forEach(resourcePayload => {
        const resourceMeta = state.resourceMetaMapByStorage.local[resourcePayload.resourceId];
        const resourceContent = state.resourceContentMapByStorage.local[resourcePayload.resourceId];
        const resource = joinK8sResource(resourceMeta, resourceContent);
        const relativeFilePath = resourcePayload.resourceFilePath.substr(rootFolder.length);
        const resourceFileEntry = state.fileMap[relativeFilePath];

        if (resourceFileEntry) {
          resourceFileEntry.timestamp = resourcePayload.fileTimestamp;
        } else {
          const extension = path.extname(relativeFilePath);
          const newFileEntry: FileEntry = {
            ...createFileEntry({fileEntryPath: relativeFilePath, fileMap: state.fileMap, extension}),
            isSupported: true,
            timestamp: resourcePayload.fileTimestamp,
          };
          state.fileMap[relativeFilePath] = newFileEntry;

          // add to parent's children
          const childFileName = path.basename(relativeFilePath);
          const parentPath = path.join(path.sep, relativeFilePath.replace(`${path.sep}${childFileName}`, '')).trim();
          const isRoot = parentPath === path.sep;

          if (isRoot) {
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
              log.warn(`[saveTransientResource]: Couldn't find parent path for ${relativeFilePath}`);
            }
          }
        }

        if (resource) {
          resource.origin = {
            filePath: relativeFilePath,
            fileOffset: 0, // TODO: get the correct offset
          };
          resource.range = resourcePayload.resourceRange;

          if (state.selection?.type === 'file' && state.selection.filePath === relativeFilePath) {
            state.highlights.push({
              type: 'resource',
              resourceIdentifier: resource,
            });
          }
        }
      });
    });

    builder.addCase(multiplePathsChanged.fulfilled, (state, action) => {
      return action.payload;
    });

    builder.addCase(multiplePathsAdded.fulfilled, (state, action) => {
      return action.payload;
    });

    builder.addCase(updateResource.fulfilled, (state, action) => {
      return action.payload;
    });

    builder.addCase(removeResources.fulfilled, (state, action) => {
      return action.payload;
    });

    builder.addCase(updateMultipleResources.fulfilled, (state, action) => {
      return action.payload;
    });

    builder.addCase(updateFileEntry.fulfilled, (state, action) => {
      return action.payload;
    });

    // TODO: does this work properly?
    builder.addCase(processResourceRefs.fulfilled, (state, action) => {
      action.payload.forEach((resource: K8sResource) => {
        const resourceMetaMap = resourceMetaMapSelector({main: state} as RootState, resource.storage);
        const resourceContentMap = resourceContentMapSelector({main: state} as RootState, resource.storage);
        const {meta, content} = splitK8sResource(resource);
        if (resourceMetaMap && resourceContentMap) {
          resourceMetaMap[resource.id] = meta;
          resourceContentMap[resource.id] = content;
        }
      });
    });

    // TODO: how do we make this work with the new resource storage?
    // builder.addCase(transferResource.fulfilled, (state, action) => {
    //   const {side, delta} = action.payload;

    //   // Warning: The compare feature has its own slice and does bookkeeping
    //   // of its own resources. This reducer works because transfer only works
    //   // for cluster and local which are also in main slice. Should we add
    //   // transfer for other resource set types this will give unexpected behavior.
    //   delta.forEach(comparison => {
    //     if (side === 'left') {
    //       state.resourceMap[comparison.left.id] = comparison.left;
    //     } else {
    //       state.resourceMap[comparison.right.id] = comparison.right;
    //     }
    //   });
    // });

    builder.addMatcher(
      () => true,
      (state, action) => {
        if (action.payload?.alert) {
          const notification: AlertType = action.payload.alert;

          state.notifications = [
            {...notification, id: uuidv4(), hasSeen: false, createdAt: new Date().getTime()},
            ...state.notifications,
          ];
        }
      }
    );
  },
});

export const {
  addResource,
  addMultipleResources,
  addKindHandler,
  addMultipleKindHandlers,
  checkMultipleResourceIds,
  checkResourceId,
  clearNotifications,
  clearPreview,
  clearPreviewAndSelectionHistory,
  clearSelection,
  closePreviewConfigurationEditor,
  closeResourceDiffModal,
  deleteFilterPreset,
  editorHasReloadedSelectedPath,
  extendResourceFilter,
  loadFilterPreset,
  multiplePathsRemoved,
  openPreviewConfigurationEditor,
  openResourceDiffModal,
  resetResourceFilter,
  saveFilterPreset,
  seenNotifications,
  selectFile,
  selectHelmValuesFile,
  selectImage,
  selectResource,
  selectPreviewConfiguration,
  setAppRehydrating,
  setApplyingResource,
  setAutosavingError,
  setAutosavingStatus,
  setFiltersToBeChanged,
  setImagesList,
  setImagesSearchedValue,
  setSelectionHistory,
  toggleMatchParams,
  uncheckAllResourceIds,
  uncheckMultipleResourceIds,
  uncheckResourceId,
  updateResourceFilter,
  updateValidationIntegration,
  highlightFileMatches,
  updateSearchHistory,
  updateSearchQuery,
  updateReplaceQuery,
  setLastChangedLine,
  updateMultipleClusterResources,
  deleteMultipleClusterResources,
} = mainSlice.actions;
export default mainSlice.reducer;
