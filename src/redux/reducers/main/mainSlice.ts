import {Draft, PayloadAction, createAsyncThunk, createSlice} from '@reduxjs/toolkit';

import isEqual from 'lodash/isEqual';
import log from 'loglevel';
import path from 'path';
import {v4 as uuidv4} from 'uuid';

import {transferResource} from '@redux/compare';
import {AppListenerFn} from '@redux/listeners/base';
import {HelmChartEventEmitter} from '@redux/services/helm';
import {previewSavedCommand} from '@redux/services/previewCommand';
import {resetSelectionHistory} from '@redux/services/selectionHistory';
import {loadPolicies} from '@redux/thunks/loadPolicies';
import {multiplePathsAdded} from '@redux/thunks/multiplePathsAdded';
import {multiplePathsChanged} from '@redux/thunks/multiplePathsChanged';
import {previewCluster, repreviewCluster} from '@redux/thunks/previewCluster';
import {previewHelmValuesFile} from '@redux/thunks/previewHelmValuesFile';
import {previewKustomization} from '@redux/thunks/previewKustomization';
import {removeResources} from '@redux/thunks/removeResources';
import {runPreviewConfiguration} from '@redux/thunks/runPreviewConfiguration';
import {saveUnsavedResources} from '@redux/thunks/saveUnsavedResources';
import {setRootFolder} from '@redux/thunks/setRootFolder';
import {updateFileEntries, updateFileEntry} from '@redux/thunks/updateFileEntry';
import {updateMultipleResources} from '@redux/thunks/updateMultipleResources';
import {updateResource} from '@redux/thunks/updateResource';

import {isResourcePassingFilter} from '@utils/resources';
import {parseYamlDocument} from '@utils/yaml';

import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {AlertType} from '@shared/models/alert';
import {
  AppState,
  FileMapType,
  HelmChartMapType,
  HelmTemplatesMapType,
  HelmValuesMapType,
  ImagesListType,
  MatchParamProps,
  PreviewType,
  ResourceFilterType,
} from '@shared/models/appState';
import {ProjectConfig} from '@shared/models/config';
import {CurrentMatch, FileEntry} from '@shared/models/fileEntry';
import {HelmChart} from '@shared/models/helm';
import {ImageType} from '@shared/models/image';
import {ValidationIntegration} from '@shared/models/integrations';
import {
  K8sResource,
  ResourceContentMap,
  ResourceMetaMap,
  ResourceStorage,
  isLocalResource,
} from '@shared/models/k8sResource';
import {LocalOrigin, PreviewOrigin} from '@shared/models/origin';
import {AppSelection, isResourceSelection} from '@shared/models/selection';
import electronStore from '@shared/utils/electronStore';
import {trackEvent} from '@shared/utils/telemetry';

import initialState from '../initialState';
import {
  createFileEntry,
  getFileEntryForAbsolutePath,
  highlightResourcesFromFile,
  removePath,
  selectFilePath,
} from '../services/fileEntry';
import {deleteResource, saveResource} from '../services/resource';
import {updateSelectionAndHighlights} from '../services/selection';
import {setAlert} from './alert';
import {selectionReducers} from './selectionReducers';
import {setLeftMenuSelection, toggleLeftMenu} from './ui';

export type SetRootFolderPayload = {
  projectConfig: ProjectConfig;
  fileMap: FileMapType;
  resourceMetaMap: ResourceMetaMap<LocalOrigin>;
  resourceContentMap: ResourceContentMap<LocalOrigin>;
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
  previewResourceMetaMap?: ResourceMetaMap<PreviewOrigin>;
  previewResourceContentMap?: ResourceContentMap<PreviewOrigin>;
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

// function getImages(resourceMap: ResourceMapType) {
//   let images: ImagesListType = [];

//   Object.values(resourceMap).forEach(k8sResource => {
//     if (k8sResource.refs?.length) {
//       k8sResource.refs.forEach(ref => {
//         if (ref.type === 'outgoing' && ref.target?.type === 'image') {
//           const refName = ref.name;
//           const refTag = ref.target?.tag || 'latest';

//           const foundImage = images.find(image => image.id === `${refName}:${refTag}`);

//           if (!foundImage) {
//             images.push({id: `${refName}:${refTag}`, name: refName, tag: refTag, resourcesIds: [k8sResource.id]});
//           } else if (!foundImage.resourcesIds.includes(k8sResource.id)) {
//             foundImage.resourcesIds.push(k8sResource.id);
//           }
//         }
//       });
//     }
//   });

//   return images;
// }

export const performResourceContentUpdate = (resource: K8sResource, newText: string, fileMap: FileMapType) => {
  if (isLocalResource(resource)) {
    const updatedFileText = saveResource(resource, newText, fileMap);
    resource.text = updatedFileText;
    fileMap[resource.origin.filePath].text = updatedFileText;
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
 * TODO: This function is not needed anymore because it was only doing processing on the resource that we were adding.
 * @deprecated
 */
export const addResource = createAsyncThunk('main/addResource', async () => {});

/**
 * TODO: This function is not needed anymore because it was only doing processing on the resources that we were adding.
 * @deprecated
 */
export const addMultipleResources = createAsyncThunk('main/addMultipleResources', async (resources, thunkAPI) => {});

const clearSelectedResourceOnPreviewExit = (state: AppState) => {
  if (state.selection?.type === 'resource' && state.selection.resourceOriginType === 'preview') {
    state.selection = undefined;
  }
};

/**
 * The main reducer slice
 */

export const mainSlice = createSlice({
  name: 'main',
  initialState: initialState.main,
  reducers: {
    ...selectionReducers,
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
    setFiltersToBeChanged: (state: Draft<AppState>, action: PayloadAction<ResourceFilterType | undefined>) => {
      state.filtersToBeChanged = action.payload;
    },
    setApplyingResource: (state: Draft<AppState>, action: PayloadAction<boolean>) => {
      state.isApplyingResource = action.payload;
    },
    clearPreview: (state: Draft<AppState>, action: PayloadAction<{type: 'restartPreview'}>) => {
      if (action.payload.type !== 'restartPreview') {
        clearSelectedResourceOnPreviewExit(state);
      }
      setPreviewData({}, state);
      state.previewType = undefined;
      state.checkedResourceIds = [];
    },
    clearPreviewAndSelectionHistory: (state: Draft<AppState>) => {
      state.selectionHistory.previous = state.selectionHistory.current;
      state.selectionHistory.current = [];
      state.selectionHistory.index = undefined;
      if (isResourceSelection(state.selection) && state.selection.resourceOriginType === 'preview') {
        state.selection = undefined;
      }
      setPreviewData({}, state);
      state.previewType = undefined;
      state.checkedResourceIds = [];
    },
    startPreviewLoader: (state: Draft<AppState>, action: PayloadAction<StartPreviewLoaderPayload>) => {
      state.previewLoader.isLoading = true;
      state.previewLoader.targetId = action.payload.targetId;
      state.previewType = action.payload.previewType;
    },
    stopPreviewLoader: (state: Draft<AppState>) => {
      state.previewLoader.isLoading = false;
      state.previewLoader.targetId = undefined;
    },
    resetResourceFilter: (state: Draft<AppState>) => {
      state.resourceFilter = {labels: {}, annotations: {}};
    },
    updateResourceFilter: (state: Draft<AppState>, action: PayloadAction<ResourceFilterType>) => {
      if (state.checkedResourceIds.length && !state.filtersToBeChanged) {
        state.filtersToBeChanged = action.payload;
        return;
      }

      if (state.filtersToBeChanged) {
        state.filtersToBeChanged = undefined;
      }

      state.resourceFilter = action.payload;
    },
    extendResourceFilter: (state: Draft<AppState>, action: PayloadAction<ResourceFilterType>) => {
      const filter = action.payload;

      if (state.checkedResourceIds.length && !state.filtersToBeChanged) {
        state.filtersToBeChanged = filter;
        return;
      }

      if (state.filtersToBeChanged) {
        state.filtersToBeChanged = undefined;
      }

      // construct new filter
      let newFilter: ResourceFilterType = {
        names: filter.names
          ? isEqual(filter.names, state.resourceFilter.names)
            ? undefined
            : filter.names
          : state.resourceFilter.names,
        namespace: filter.namespace
          ? filter.namespace === state.resourceFilter.namespace
            ? undefined
            : filter.namespace
          : state.resourceFilter.namespace,
        kinds: filter.kinds
          ? isEqual(filter.kinds, state.resourceFilter.kinds)
            ? undefined
            : filter.kinds
          : state.resourceFilter.kinds,
        fileOrFolderContainedIn: filter.fileOrFolderContainedIn
          ? filter.fileOrFolderContainedIn === state.resourceFilter.fileOrFolderContainedIn
            ? undefined
            : filter.fileOrFolderContainedIn
          : state.resourceFilter.fileOrFolderContainedIn,
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

    setImagesSearchedValue: (state: Draft<AppState>, action: PayloadAction<string>) => {
      state.imagesSearchedValue = action.payload;
    },
    setLastChangedLine: (state: Draft<AppState>, action: PayloadAction<number>) => {
      state.lastChangedLine = action.payload;
    },
    setImagesList: (state: Draft<AppState>, action: PayloadAction<ImagesListType>) => {
      state.imagesList = action.payload;
    },
    deleteFilterPreset: (state: Draft<AppState>, action: PayloadAction<string>) => {
      delete state.filtersPresets[action.payload];
      electronStore.set('main.filtersPresets', state.filtersPresets);
    },
    loadFilterPreset: (state: Draft<AppState>, action: PayloadAction<string>) => {
      state.resourceFilter = state.filtersPresets[action.payload];
    },
    saveFilterPreset: (state: Draft<AppState>, action: PayloadAction<string>) => {
      state.filtersPresets[action.payload] = state.resourceFilter;
      electronStore.set('main.filtersPresets', state.filtersPresets);
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
        state.resourceMap[r.id] = r;
      });
    },
    deleteMultipleClusterResources: (state: Draft<AppState>, action: PayloadAction<K8sResource[]>) => {
      action.payload.forEach((r: K8sResource) => {
        delete state.resourceMap[r.id];
      });
    },
    setIsClusterConnected: (state: Draft<AppState>, action: PayloadAction<boolean>) => {
      state.isClusterConnected = action.payload;
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

    builder
      .addCase(previewKustomization.fulfilled, (state, action) => {
        setPreviewData(action.payload, state);
        state.previewLoader.isLoading = false;
        state.previewLoader.targetId = undefined;
        resetSelectionHistory(state, {initialResourceIds: [state.previewResourceId]});
        state.selectedResourceId = action.payload.previewResourceId;
        state.selectedPath = undefined;
        state.selectedValuesFileId = undefined;
        state.selectedPreviewConfigurationId = undefined;
        state.checkedResourceIds = [];
        state.previousSelectionHistory = [];
      })
      .addCase(previewKustomization.rejected, state => {
        state.previewLoader.isLoading = false;
        state.previewLoader.targetId = undefined;
        state.previewType = undefined;
        state.selectionHistory = state.previousSelectionHistory;
        state.previousSelectionHistory = [];
      });

    builder
      .addCase(previewHelmValuesFile.fulfilled, (state, action) => {
        setPreviewData(action.payload, state);
        state.previewLoader.isLoading = false;
        state.previewLoader.targetId = undefined;
        state.currentSelectionHistoryIndex = undefined;
        resetSelectionHistory(state);
        state.selectedResourceId = undefined;
        state.selectedImage = undefined;
        state.checkedResourceIds = [];
        if (action.payload.previewResourceId && state.helmValuesMap[action.payload.previewResourceId]) {
          selectFilePath({filePath: state.helmValuesMap[action.payload.previewResourceId].filePath, state});
        }
        state.selectedValuesFileId = action.payload.previewResourceId;
        state.previousSelectionHistory = [];
      })
      .addCase(previewHelmValuesFile.rejected, state => {
        state.previewLoader.isLoading = false;
        state.previewLoader.targetId = undefined;
        state.previewType = undefined;
        state.selectionHistory = state.previousSelectionHistory;
        state.previousSelectionHistory = [];
      });

    builder
      .addCase(runPreviewConfiguration.fulfilled, (state, action) => {
        setPreviewData(action.payload, state);
        state.previewLoader.isLoading = false;
        state.previewLoader.targetId = undefined;
        state.currentSelectionHistoryIndex = undefined;
        resetSelectionHistory(state);
        state.selectedResourceId = undefined;
        state.selectedImage = undefined;
        state.selectedPath = undefined;
        state.checkedResourceIds = [];
        state.previousSelectionHistory = [];
      })
      .addCase(runPreviewConfiguration.rejected, state => {
        state.previewLoader.isLoading = false;
        state.previewLoader.targetId = undefined;
        state.previewType = undefined;
        state.selectionHistory = state.previousSelectionHistory;
        state.previousSelectionHistory = [];
      });

    builder
      .addCase(previewSavedCommand.fulfilled, (state, action) => {
        setPreviewData(action.payload, state);
        state.previewLoader.isLoading = false;
        state.previewLoader.targetId = undefined;
        state.currentSelectionHistoryIndex = undefined;
        resetSelectionHistory(state);
        state.selectedResourceId = undefined;
        state.selectedImage = undefined;
        state.selectedPath = undefined;
        state.checkedResourceIds = [];
        state.previousSelectionHistory = [];
      })
      .addCase(previewSavedCommand.rejected, state => {
        state.previewLoader.isLoading = false;
        state.previewLoader.targetId = undefined;
        state.previewType = undefined;
        state.selectionHistory = state.previousSelectionHistory;
        state.previousSelectionHistory = [];
      });

    builder
      .addCase(previewCluster.fulfilled, (state, action) => {
        setPreviewData(action.payload, state);
        state.previewLoader.isLoading = false;
        state.previewLoader.targetId = undefined;
        resetSelectionHistory(state, {initialResourceIds: [state.previewResourceId]});
        state.selectedResourceId = undefined;
        state.selectedPath = undefined;
        state.selectedValuesFileId = undefined;
        state.selectedPreviewConfigurationId = undefined;
        state.checkedResourceIds = [];
        state.selectedImage = undefined;
        Object.values(state.resourceMap).forEach(resource => {
          resource.isSelected = false;
          resource.isHighlighted = false;
        });
        state.previousSelectionHistory = [];
      })
      .addCase(previewCluster.rejected, state => {
        state.previewLoader.isLoading = false;
        state.previewLoader.targetId = undefined;
        state.previewType = undefined;
        state.selectionHistory = state.previousSelectionHistory;
        state.previousSelectionHistory = [];
      });

    builder
      .addCase(repreviewCluster.fulfilled, (state, action) => {
        setPreviewData(action.payload, state);
        state.previewLoader.isLoading = false;
        state.previewLoader.targetId = undefined;
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
        state.previewLoader.targetId = undefined;
        state.previewType = undefined;
      });

    builder.addCase(setRootFolder.pending, state => {
      const existingHelmCharts: HelmChart[] = JSON.parse(JSON.stringify(Object.values(state.helmChartMap)));
      if (existingHelmCharts.length) {
        setImmediate(() => existingHelmCharts.forEach(chart => HelmChartEventEmitter.emit('remove', chart.id)));
      }
    });

    builder.addCase(setRootFolder.fulfilled, (state, action) => {
      state.resourceMap = action.payload.resourceMap;
      state.fileMap = action.payload.fileMap;
      state.helmChartMap = action.payload.helmChartMap;
      state.helmValuesMap = action.payload.helmValuesMap;
      state.helmTemplatesMap = action.payload.helmTemplatesMap;
      state.previewLoader.isLoading = false;
      state.previewLoader.targetId = undefined;
      state.selectedResourceId = undefined;
      state.selectedImage = undefined;
      state.selectedValuesFileId = undefined;
      state.selectedPath = undefined;
      state.previewResourceId = undefined;
      state.previewConfigurationId = undefined;
      state.previewCommandId = undefined;
      state.previewType = undefined;
      state.previewValuesFileId = undefined;
      state.selectedPreviewConfigurationId = undefined;
      state.previewLoader = {
        isLoading: false,
        targetId: undefined,
      };
      state.checkedResourceIds = [];
      state.resourceDiff = {
        targetResourceId: undefined,
      };
      state.isSelectingFile = false;
      state.isApplyingResource = false;
      state.resourceFilter = {
        labels: {},
        annotations: {},
      };
      resetSelectionHistory(state);
    });

    builder.addCase(saveUnsavedResources.fulfilled, (state, action) => {
      const rootFolder = state.fileMap[ROOT_FILE_ENTRY].filePath;

      action.payload.resourcePayloads.forEach(resourcePayload => {
        const resource = state.resourceMap[resourcePayload.resourceId];
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
              log.warn(`[saveUnsavedResource]: Couldn't find parent path for ${relativeFilePath}`);
            }
          }
        }

        if (resource) {
          resource.filePath = relativeFilePath;
          resource.range = resourcePayload.resourceRange;

          if (state.selectedPath === relativeFilePath) {
            resource.isHighlighted = true;
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

    builder.addCase(updateFileEntries.fulfilled, (state, action) => {
      return action.payload;
    });

    builder.addCase(updateShouldOptionalIgnoreUnsatisfiedRefs.fulfilled, (state, action) => {
      return action.payload;
    });

    builder.addCase(addResource.fulfilled, (state, action) => {
      return action.payload;
    });

    builder.addCase(addMultipleResources.fulfilled, (state, action) => {
      return action.payload;
    });

    builder.addCase(reprocessResource.fulfilled, (state, action) => {
      return action.payload;
    });

    builder.addCase(reprocessAllResources.fulfilled, (state, action) => {
      return action.payload;
    });

    builder.addCase(transferResource.fulfilled, (state, action) => {
      const {side, delta} = action.payload;

      // Warning: The compare feature has its own slice and does bookkeeping
      // of its own resources. This reducer works because transfer only works
      // for cluster and local which are also in main slice. Should we add
      // transfer for other resource set types this will give unexpected behavior.
      delta.forEach(comparison => {
        if (side === 'left') {
          state.resourceMap[comparison.left.id] = comparison.left;
        } else {
          state.resourceMap[comparison.right.id] = comparison.right;
        }
      });
    });
    builder.addCase(loadPolicies.fulfilled, (state, action) => {
      state.policies = {
        plugins: action.payload,
      };
    });

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

// function groupResourcesByIdentifier(
//   resources: K8sResource[],
//   makeIdentifier: (resource: K8sResource) => string
// ): Record<string, K8sResource[]> {
//   const groupedResources: Record<string, K8sResource[]> = {};
//   resources.forEach(resource => {
//     const identifier = makeIdentifier(resource);
//     if (groupedResources[identifier]) {
//       groupedResources[identifier].push(resource);
//     } else {
//       groupedResources[identifier] = [resource];
//     }
//   });
//   return groupedResources;
// }

/**
 * Sets/clears preview resources
 */

function setPreviewData(payload: SetPreviewDataPayload, state: AppState) {
  state.previewResourceId = undefined;
  state.previewValuesFileId = undefined;
  state.previewConfigurationId = undefined;
  state.previewCommandId = undefined;

  // TODO: rename "previewResourceId" to "previewTargetId" and maybe add a comment to the property

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
    if (state.previewType === 'helm-preview-config') {
      state.previewConfigurationId = payload.previewResourceId;
    }
    if (state.previewType === 'command') {
      state.previewCommandId = payload.previewResourceId;
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
  addKindHandler,
  addMultipleKindHandlers,
  checkMultipleResourceIds,
  checkResourceId,
  clearNotifications,
  clearPreview,
  clearPreviewAndSelectionHistory,
  clearSelected,
  clearSelectedPath,
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
  selectK8sResource,
  selectPreviewConfiguration,
  setAppRehydrating,
  setApplyingResource,
  setAutosavingError,
  setAutosavingStatus,
  setFiltersToBeChanged,
  setImagesList,
  setImagesSearchedValue,
  setSelectingFile,
  setSelectionHistory,
  startPreviewLoader,
  stopPreviewLoader,
  toggleAllRules,
  toggleMatchParams,
  toggleRule,
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
  setIsClusterConnected,
  updateMultipleClusterResources,
  deleteMultipleClusterResources,
} = mainSlice.actions;
export default mainSlice.reducer;

/* * * * * * * * * * * * * *
 * Listeners
 * * * * * * * * * * * * * */
export const resourceMapChangedListener: AppListenerFn = listen => {
  listen({
    predicate: (action, currentState, previousState) => {
      return (
        !isEqual(currentState.main.resourceMap, previousState.main.resourceMap) ||
        !isEqual(currentState.main.resourceFilter, previousState.main.resourceFilter)
      );
    },

    effect: async (_action, {dispatch, getState}) => {
      const resourceFilter = getState().main.resourceFilter;
      const resourceMap = getActiveResourceMap(getState().main);

      const currentResourcesMap = Object.fromEntries(
        Object.entries(resourceMap).filter(([, value]) => isResourcePassingFilter(value, resourceFilter))
      );

      const imagesList = getState().main.imagesList;
      const images = getImages(currentResourcesMap);

      if (!isEqual(images, imagesList)) {
        dispatch(setImagesList(images));
      }
    },
  });
};

export const imageSelectedListener: AppListenerFn = listen => {
  listen({
    type: selectImage.type,
    effect: async (_action, {dispatch, getState}) => {
      const leftMenu = getState().ui.leftMenu;

      if (!leftMenu.isActive) {
        dispatch(toggleLeftMenu());
      }

      if (leftMenu.selection !== 'images-pane') {
        dispatch(setLeftMenuSelection('images-pane'));
      }
    },
  });
};
