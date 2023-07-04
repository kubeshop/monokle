import {Draft, PayloadAction, createSlice} from '@reduxjs/toolkit';

import log from 'loglevel';
import path from 'path';
import {v4 as uuidv4} from 'uuid';

import {connectCluster} from '@redux/cluster/thunks/connect';
import initialState from '@redux/initialState';
import {processResourceRefs} from '@redux/parsing/parser.thunks';
import {RESOURCE_PARSER} from '@redux/parsing/resourceParser';
import {setAlert} from '@redux/reducers/alert';
import {getResourceContentMapFromState, getResourceMetaMapFromState} from '@redux/selectors/resourceMapGetters';
import {disconnectFromCluster} from '@redux/services/clusterResourceWatcher';
import {createFileEntry, getFileEntryForAbsolutePath, removePath} from '@redux/services/fileEntry';
import {HelmChartEventEmitter} from '@redux/services/helm';
import {
  isResourceSelected,
  isSupportedResource,
  saveResource,
  splitK8sResource,
  splitK8sResourceMap,
} from '@redux/services/resource';
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

import {parseYamlDocument} from '@utils/yaml';

import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {AlertType} from '@shared/models/alert';
import {
  ActionPaneTab,
  AppState,
  FileMapType,
  HelmChartMapType,
  HelmTemplatesMapType,
  HelmValuesMapType,
} from '@shared/models/appState';
import {ProjectConfig} from '@shared/models/config';
import {FileEntry} from '@shared/models/fileEntry';
import {HelmChart} from '@shared/models/helm';
import {
  K8sResource,
  ResourceContent,
  ResourceContentMap,
  ResourceIdentifier,
  ResourceMeta,
  ResourceMetaMap,
  isClusterResource,
  isLocalResource,
} from '@shared/models/k8sResource';
import {PreviewType} from '@shared/models/preview';
import {RootState} from '@shared/models/rootState';
import {AppSelection, isResourceSelection} from '@shared/models/selection';
import electronStore from '@shared/utils/electronStore';
import {isEqual} from '@shared/utils/isEqual';
import {trackEvent} from '@shared/utils/telemetry';

import {filterReducers} from './filterReducers';
import {imageReducers} from './imageReducers';
import {clearPreviewReducer, previewExtraReducers, previewReducers} from './previewReducers';
import {
  clearSelectionReducer,
  createResourceHighlights,
  selectResourceReducer,
  selectionReducers,
} from './selectionReducers';

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
  isReload?: boolean;
};

export type SetRootFolderArgs = {
  rootFolder: string | null;
  isReload?: boolean;
};

export type UpdateMultipleResourcesPayload = {
  resourceIdentifier: ResourceIdentifier;
  content: string;
}[];

export type UpdateFileEntryPayload = {
  isUpdateFromEditor?: boolean; // this is used by the editor listeners
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
    return {text: updatedFileText, object: parseYamlDocument(updatedFileText).toJS()};
  }
  return {text: newText, object: parseYamlDocument(newText).toJS()};
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

  const resourceMetaMap = state.resourceMetaMapByStorage[meta.storage] as ResourceMetaMap<typeof resource.storage>;
  resourceMetaMap[meta.id] = meta;

  const resourceContentMap = state.resourceContentMapByStorage[content.storage] as ResourceContentMap<
    typeof resource.storage
  >;
  resourceContentMap[content.id] = content;
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
      action: PayloadAction<{helmChartId?: string; previewConfigurationId?: string}>
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

    setPreviewConfigurationEditorHelmChartId: (state: Draft<AppState>, action: PayloadAction<string>) => {
      state.prevConfEditor.helmChartId = action.payload;
    },

    setLastChangedLine: (state: Draft<AppState>, action: PayloadAction<number>) => {
      state.lastChangedLine = action.payload;
    },

    updateMultipleClusterResources: (state: Draft<AppState>, action: PayloadAction<K8sResource[]>) => {
      action.payload.forEach((r: K8sResource) => {
        if (!isClusterResource(r)) {
          return;
        }
        // TODO: this action should probably receive only the new content? and then we check if anything has changed in the meta?
        // because right now if we do changes to the meta, for example setting refs after processing, if we replace the whole meta,
        // we lose the refs.
        // Old code for context:
        // const {meta, content} = splitK8sResource(r);
        // state.resourceMetaMapByStorage.cluster[r.id] = meta;
        // state.resourceContentMapByStorage.cluster[r.id] = content;
        // Quick fix:
        const originalResourceMeta = state.resourceMetaMapByStorage.cluster[r.id];
        const {meta, content} = splitK8sResource(r);
        const newMeta = {...originalResourceMeta, ...meta, refs: originalResourceMeta?.refs};
        state.resourceMetaMapByStorage.cluster[r.id] = newMeta;
        state.resourceContentMapByStorage.cluster[r.id] = content;
      });
    },
    deleteMultipleClusterResources: (state: Draft<AppState>, action: PayloadAction<K8sResource[]>) => {
      action.payload.forEach((r: K8sResource) => {
        delete state.resourceMetaMapByStorage.cluster[r.id];
        delete state.resourceContentMapByStorage.cluster[r.id];
      });

      RESOURCE_PARSER.clear(action.payload.map((r: K8sResource) => r.id));

      // clear the selection if the selected resource has been deleted
      const selection = state.selection;
      if (isResourceSelection(selection)) {
        const selectedResourceIdentifier = selection.resourceIdentifier;
        if (
          action.payload.some(
            r => r.id === selectedResourceIdentifier.id && r.storage === selectedResourceIdentifier.storage
          )
        ) {
          clearSelectionReducer(state);
        }
      }
    },
    setActiveEditorTab: (state: Draft<AppState>, action: PayloadAction<ActionPaneTab>) => {
      state.activeEditorTab = action.payload;
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

    builder.addCase(connectCluster.rejected, state => {
      state.clusterConnectionOptions.isLoading = false;
    });
    builder.addCase(connectCluster.pending, state => {
      state.clusterConnectionOptions.isLoading = true;
    });
    builder.addCase(connectCluster.fulfilled, state => {
      state.clusterConnectionOptions.isLoading = false;
    });

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
        disconnectFromCluster();
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

      state.resourceMetaMapByStorage.cluster = {};
      state.resourceContentMapByStorage.cluster = {};
    });

    builder.addCase(setRootFolder.fulfilled, (state, action) => {
      state.resourceMetaMapByStorage.local = action.payload.resourceMetaMap;
      state.resourceContentMapByStorage.local = action.payload.resourceContentMap;
      state.fileMap = action.payload.fileMap;
      state.helmChartMap = action.payload.helmChartMap;
      state.helmValuesMap = action.payload.helmValuesMap;
      state.helmTemplatesMap = action.payload.helmTemplatesMap;

      if (!action.payload.isReload) {
        state.resourceMetaMapByStorage.transient = {};
        state.resourceContentMapByStorage.transient = {};
      }

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
        const resourceMeta = state.resourceMetaMapByStorage.transient[resourcePayload.resourceId];
        const resourceContent = state.resourceContentMapByStorage.transient[resourcePayload.resourceId];
        const relativeFilePath = resourcePayload.resourceFilePath.substring(rootFolder.length);
        const resourceFileEntry = state.fileMap[relativeFilePath];

        if (resourceFileEntry) {
          resourceFileEntry.timestamp = resourcePayload.fileTimestamp;
        } else {
          const extension = path.extname(relativeFilePath);

          //
          const newFileEntry: FileEntry = {
            ...createFileEntry({fileEntryPath: relativeFilePath, fileMap: state.fileMap, extension, projectConfig: {}}),
            isExcluded: resourcePayload.isExcluded,
            containsK8sResources: isSupportedResource(resourceMeta),
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

        if (resourceMeta && resourceContent) {
          const newResourceMeta: ResourceMeta<'local'> = {
            ...resourceMeta,
            storage: 'local',
            origin: {
              filePath: relativeFilePath,
              fileOffset: 0, // TODO: get the correct offset
            },
            range: resourcePayload.resourceRange,
          };

          const newResourceContent: ResourceContent<'local'> = {
            ...resourceContent,
            storage: 'local',
          };

          if (state.selection?.type === 'file' && state.selection.filePath === relativeFilePath) {
            state.highlights.push({
              type: 'resource',
              resourceIdentifier: resourceMeta,
            });
          }

          delete state.resourceMetaMapByStorage.transient[resourceMeta.id];
          delete state.resourceContentMapByStorage.transient[resourceMeta.id];
          state.resourceMetaMapByStorage.local[newResourceMeta.id] = newResourceMeta;
          state.resourceContentMapByStorage.local[newResourceMeta.id] = newResourceContent;
          if (isResourceSelected({id: resourceMeta.id, storage: 'transient'}, state.selection)) {
            selectResourceReducer(state, {resourceIdentifier: newResourceMeta});
          }
        }
      });
    });

    builder.addCase(multiplePathsChanged.fulfilled, (state, action) => {
      return action.payload.nextMainState;
    });

    builder.addCase(multiplePathsAdded.fulfilled, (state, action) => {
      return action.payload.nextMainState;
    });

    builder.addCase(updateResource.pending, state => {
      state.autosaving.status = true;
    });

    builder.addCase(updateResource.fulfilled, (state, action) => {
      return action.payload.nextMainState;
    });

    builder.addCase(removeResources.fulfilled, (state, action) => {
      return action.payload.nextMainState;
    });

    builder.addCase(updateMultipleResources.fulfilled, (state, action) => {
      return action.payload.nextMainState;
    });

    builder.addCase(updateFileEntry.pending, state => {
      state.autosaving.status = true;
    });

    builder.addCase(updateFileEntry.fulfilled, (state, action) => {
      return action.payload.nextMainState;
    });

    builder.addCase(processResourceRefs.fulfilled, (state, action) => {
      action.payload.forEach((resource: K8sResource) => {
        const resourceMetaMap = getResourceMetaMapFromState({main: state} as RootState, resource.storage);
        const resourceContentMap = getResourceContentMapFromState({main: state} as RootState, resource.storage);
        const {meta, content} = splitK8sResource(resource);
        if (resourceMetaMap && resourceContentMap) {
          resourceMetaMap[resource.id] = meta;
          resourceContentMap[resource.id] = content;
        }
      });

      const selection = state.selection;
      if (selection?.type === 'resource') {
        const resourceIdentifier = selection.resourceIdentifier;
        // TODO: 2.0+ should processResourceRefs return the storage as well so we can first check if the selection matches it?
        const resource = action.payload.find(
          r => r.id === resourceIdentifier.id && r.storage === resourceIdentifier.storage
        );
        if (resource) {
          state.highlights = createResourceHighlights(resource);
        }
      }
    });

    // TODO: 2.0+ how do we make this work with the new resource storage?
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
  setImageMap,
  setImagesSearchedValue,
  setPreviewConfigurationEditorHelmChartId,
  setSelectionHistory,
  uncheckAllResourceIds,
  uncheckMultipleResourceIds,
  uncheckResourceId,
  updateResourceFilter,
  setLastChangedLine,
  updateMultipleClusterResources,
  deleteMultipleClusterResources,
  setActiveEditorTab,
} = mainSlice.actions;
export default mainSlice.reducer;
