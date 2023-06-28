import fs from 'fs';
import log from 'loglevel';
import micromatch from 'micromatch';
import path from 'path';

import {ADDITIONAL_SUPPORTED_FILES, SUPPORTED_TEXT_EXTENSIONS} from '@constants/constants';

import {clearSelectionReducer, selectFileReducer, selectResourceReducer} from '@redux/reducers/main/selectionReducers';
import {
  HelmChartEventEmitter,
  createHelmChart,
  createHelmTemplate,
  createHelmValuesFile,
  findContainingHelmCharts,
  getHelmChartFromFileEntry,
  getHelmChartName,
  getHelmValuesFile,
  isHelmChartFolder,
  processHelmChartFolder,
} from '@redux/services/helm';
import {createChildrenResourcesHighlights} from '@redux/services/selection';

import {getFileStats, getFileTimestamp} from '@utils/files';
import {filterGitFolder} from '@utils/git';

import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {
  AppState,
  FileMapType,
  HelmChartMapType,
  HelmTemplatesMapType,
  HelmValuesMapType,
} from '@shared/models/appState';
import {ProjectConfig} from '@shared/models/config';
import {FileEntry, FileSideEffect} from '@shared/models/fileEntry';
import {HelmChart, HelmValuesFile} from '@shared/models/helm';
import {
  K8sResource,
  ResourceContentMap,
  ResourceIdentifier,
  ResourceMeta,
  ResourceMetaMap,
} from '@shared/models/k8sResource';
import {AppSelection, ResourceSelection} from '@shared/models/selection';
import {isHelmChartFile, isHelmTemplateFile, isHelmValuesFile} from '@shared/utils/helm';

import {deleteResource, extractK8sResources, isSupportedResource, joinK8sResource, splitK8sResource} from './resource';

type PathRemovalSideEffect = {
  removedResources: ResourceIdentifier[];
  removedHelmCharts: HelmChart[];
  removedHelmValuesFiles: HelmValuesFile[];
};

/**
 * Creates a FileEntry for the specified relative path
 */

interface CreateFileEntryArgs {
  fileEntryPath: string;
  fileMap: FileMapType;
  helmChartId?: string;
  extension: string;
  projectConfig: ProjectConfig;
}

// TODO: Maybe text shouldn't be optional
export function createFileEntry({fileEntryPath, fileMap, helmChartId, extension, projectConfig}: CreateFileEntryArgs) {
  const fileEntry: FileEntry = {
    name: path.basename(fileEntryPath),
    filePath: fileEntryPath,
    rootFolderPath: fileMap[ROOT_FILE_ENTRY].filePath,
    isExcluded: Boolean(fileIsExcluded(fileEntryPath, projectConfig)),
    containsK8sResources:
      SUPPORTED_TEXT_EXTENSIONS.some(supportedExtension => supportedExtension === extension) ||
      ADDITIONAL_SUPPORTED_FILES.some(supportedExtension => supportedExtension === path.basename(fileEntryPath)),
    helmChartId,
    extension,
  };

  const timestamp = getFileTimestamp(getAbsoluteFilePath(fileEntryPath, fileMap));
  if (timestamp) {
    fileEntry.timestamp = timestamp;
  }

  fileMap[fileEntry.filePath] = fileEntry;
  return fileEntry;
}

/**
 * Creates the file entry for the root folder
 */

export function createRootFileEntry(rootFolder: string, fileMap: FileMapType) {
  const rootEntry: FileEntry = {
    name: ROOT_FILE_ENTRY,
    filePath: rootFolder,
    rootFolderPath: rootFolder,
    isExcluded: false,
    extension: path.extname(rootFolder),
  };
  fileMap[ROOT_FILE_ENTRY] = rootEntry;
  return rootEntry;
}

/**
 * Checks if the specified filename should be excluded per the project exclusion config
 */

export function fileIsExcluded(filePath: FileEntry['filePath'], projectConfig: ProjectConfig) {
  return projectConfig.scanExcludes?.some(e => {
    return micromatch.isMatch(filePath, e) || filePath.startsWith(e);
  });
}

/**
 * Checks if the specified filename should be excluded per the project inclusion config
 */

export function fileIsIncluded(filePath: FileEntry['filePath'], projectConfig: ProjectConfig) {
  return projectConfig.fileIncludes?.some(e => micromatch.isMatch(path.basename(filePath), e));
}

/**
 * Returns the root folder for the specified fileMap
 */

export function getRootFolder(fileMap: FileMapType) {
  return fileMap && fileMap[ROOT_FILE_ENTRY] ? fileMap[ROOT_FILE_ENTRY].filePath : undefined;
}

/**
 * Extracts resources for the specified FileEntry and marks the FileEntry as supported
 * if all contained resources are supported
 */

export function extractResourcesForFileEntry(fileEntry: FileEntry, rootFolderPath: string): K8sResource<'local'>[] {
  const result: K8sResource<'local'>[] = [];

  try {
    extractK8sResourcesFromFile(fileEntry.filePath, rootFolderPath).forEach(resource => {
      // TODO: shouldn't we filter out resources that are not supported?
      if (!isSupportedResource(resource)) {
        return;
      }

      result.push(resource);
    });
  } catch (e) {
    log.warn(`Failed to parse yaml in file ${fileEntry.name}; ${e}`);
  }

  if (result.length > 0) {
    fileEntry.containsK8sResources = true;
  }

  return result;
}

/**
 * Recursively reads the provided folder in line with the provided appConfig and populates the
 * provided maps with found files and resources.
 *
 * Returns the list of filenames (not paths) found in the specified folder
 */

export function readFiles(
  folder: string,
  stateArgs: {
    projectConfig: ProjectConfig;
    resourceMetaMap: ResourceMetaMap<'local'>;
    resourceContentMap: ResourceContentMap<'local'>;
    fileMap: FileMapType;
    helmChartMap: HelmChartMapType;
    helmValuesMap: HelmValuesMapType;
    helmTemplatesMap: HelmTemplatesMapType;
  },
  depth: number = 1,
  helmChart?: HelmChart,
  sideEffect?: FileSideEffect
) {
  const {projectConfig, resourceMetaMap, resourceContentMap, fileMap, helmChartMap, helmValuesMap, helmTemplatesMap} =
    stateArgs;
  const files = fs.readdirSync(folder);
  const result: string[] = [];

  // if there is no root entry assume this is the root folder (questionable..)
  if (!fileMap[ROOT_FILE_ENTRY]) {
    createRootFileEntry(folder, fileMap);
  }

  const rootFolder = fileMap[ROOT_FILE_ENTRY].filePath;

  // is this a helm chart folder?
  if (isHelmChartFolder(files)) {
    result.push(
      ...processHelmChartFolder(
        folder,
        rootFolder,
        files,
        {
          projectConfig,
          resourceMetaMap,
          resourceContentMap,
          fileMap,
          helmChartMap,
          helmValuesMap,
          helmTemplatesMap,
        },
        depth,
        helmChart
      )
    );
  } else {
    // TODO: we should also filter files from .gitignore
    filterGitFolder(files).forEach(file => {
      const filePath = path.join(folder, file);
      const fileEntryPath = filePath.substring(rootFolder.length);
      const isDir = getFileStats(filePath)?.isDirectory();
      const isExcluded = fileIsExcluded(fileEntryPath, projectConfig);
      let extension = isDir ? '' : path.extname(fileEntryPath);
      const fileEntry = createFileEntry({fileEntryPath, fileMap, helmChartId: helmChart?.id, extension, projectConfig});

      if (helmChart && isHelmTemplateFile(fileEntry.filePath) && !isExcluded) {
        createHelmTemplate(fileEntry, helmChart, fileMap, helmTemplatesMap);
      }

      if (isExcluded) {
        fileEntry.isExcluded = true;
      }

      if (isDir) {
        const folderReadsMaxDepth = projectConfig.folderReadsMaxDepth;
        if (depth === folderReadsMaxDepth) {
          log.warn(`[readFiles]: Ignored ${filePath} because max depth was reached.`);
        } else if (isExcluded) {
          fileEntry.children = [];
        } else {
          fileEntry.children = readFiles(
            filePath,
            {
              projectConfig,
              resourceMetaMap,
              resourceContentMap,
              fileMap,
              helmChartMap,
              helmValuesMap,
              helmTemplatesMap,
            },
            depth + 1,
            helmChart
          );
        }
      } else if (helmChart && isHelmValuesFile(fileEntry.name) && !isExcluded) {
        createHelmValuesFile({
          fileEntry,
          helmChart,
          helmValuesMap,
          fileMap,
        });
      } else if (fileIsIncluded(fileEntry.filePath, projectConfig) && !isExcluded) {
        // log.info('Extracting resources for file entry: ', fileEntry.name);
        const resourcesFromFile = extractResourcesForFileEntry(fileEntry, rootFolder);
        resourcesFromFile.forEach(resource => {
          if (sideEffect) {
            sideEffect.affectedResourceIds.push(resource.id);
          }
          const {meta, content} = splitK8sResource(resource);
          resourceMetaMap[meta.id] = meta;
          resourceContentMap[meta.id] = content;
        });
      }

      result.push(fileEntry.name);
    });
  }

  return result;
}

/**
 * Returns all local resource metas associated with the specified path
 */

export function getLocalResourceMetasForPath(filePath: string, resourceMetaMap: ResourceMetaMap<'local'>) {
  return Object.values(resourceMetaMap).filter(r => r.origin.filePath === filePath);
}

/**
 * Returns all local resources associated with the specified path
 */

export function getLocalResourcesForPath(
  filePath: string,
  stateArgs: {resourceMetaMap: ResourceMetaMap<'local'>; resourceContentMap: ResourceContentMap<'local'>}
) {
  const {resourceMetaMap, resourceContentMap} = stateArgs;
  return Object.values(resourceMetaMap)
    .filter(r => r.origin.filePath === filePath)
    .map(meta => joinK8sResource(meta, resourceContentMap[meta.id]));
}

/**
 * Returns the absolute path to the folder containing the file containing the
 * specified resource
 */

export function getAbsoluteResourceFolder(resource: ResourceMeta<'local'>, fileMap: FileMapType) {
  return path.join(fileMap[ROOT_FILE_ENTRY].filePath, path.dirname(resource.origin.filePath));
}

/**
 * Returns the relative path to the folder containing the file containing the
 * specified resource
 */

export function getResourceFolder(resource: ResourceMeta<'local'>) {
  return resource.origin.filePath.substring(0, resource.origin.filePath.lastIndexOf(path.sep));
}

/**
 * Returns the absolute path to the file that containing specified resource
 */

export function getAbsoluteResourcePath(resource: ResourceMeta<'local'>, fileMap: FileMapType) {
  return path.join(fileMap[ROOT_FILE_ENTRY].filePath, resource.origin.filePath);
}

/**
 * Returns the absolute path for the specified relative path
 */

export function getAbsoluteFilePath(relativePath: string, fileMap: FileMapType) {
  return path.join(fileMap[ROOT_FILE_ENTRY].filePath, relativePath);
}

/**
 * Returns the absolute path to the specified FileEntry
 */

export function getAbsoluteFileEntryPath(fileEntry: FileEntry, fileMap: FileMapType) {
  return path.join(fileMap[ROOT_FILE_ENTRY].filePath, fileEntry.filePath);
}

/**
 * Returns the absolute path to the specified HelmChart
 */

export function getAbsoluteHelmChartPath(helmChart: HelmChart, fileMap: FileMapType) {
  return path.join(fileMap[ROOT_FILE_ENTRY].filePath, helmChart.filePath);
}

/**
 * Returns the absolute path to the specified Helm Values File
 */

export function getAbsoluteValuesFilePath(helmValuesFile: HelmValuesFile, fileMap: FileMapType) {
  return path.join(fileMap[ROOT_FILE_ENTRY].filePath, helmValuesFile.filePath);
}

/**
 * Extracts all resources from the file at the specified path
 */

export function extractK8sResourcesFromFile(relativePath: string, rootFolderPath: string): K8sResource<'local'>[] {
  const fileContent = fs.readFileSync(path.join(rootFolderPath, relativePath), 'utf8');
  return extractK8sResources(fileContent, 'local', {filePath: relativePath, fileOffset: 0});
}

/**
 * Returns a list of all FileEntries "leading up" to (and including) the specified path
 */

export function getAllFileEntriesForPath(filePath: string, fileMap: FileMapType) {
  let parent = fileMap[ROOT_FILE_ENTRY];
  const result: FileEntry[] = [];
  filePath.split(path.sep).forEach(pathSegment => {
    if (parent.children?.includes(pathSegment)) {
      const child = fileMap[getChildFilePath(pathSegment, parent, fileMap)];
      if (child) {
        result.push(child);
        parent = child;
      }
    }
  });

  return result;
}

/**
 * Gets the relative path of a child to a specified parent
 */

export function getChildFilePath(child: string, parentEntry: FileEntry, fileMap: FileMapType) {
  return parentEntry === fileMap[ROOT_FILE_ENTRY] ? path.sep + child : path.join(parentEntry.filePath, child);
}

/**
 * Returns the fileEntry for the specified absolute path
 */

export function getFileEntryForAbsolutePath(filePath: string, fileMap: FileMapType) {
  if (!fileMap[ROOT_FILE_ENTRY]) {
    return undefined;
  }

  const rootFolder = fileMap[ROOT_FILE_ENTRY].filePath;
  if (filePath === rootFolder) {
    return fileMap[ROOT_FILE_ENTRY];
  }
  return filePath.startsWith(rootFolder) ? fileMap[filePath.slice(rootFolder.length)] : undefined;
}

/**
 * Checks if the specified file should be reloaded based on project configuration
 */

function shouldReloadResourcesFromFile(fileEntry: FileEntry, projectConfig: ProjectConfig) {
  return (
    !isHelmValuesFile(fileEntry.filePath) &&
    !fileIsExcluded(fileEntry.filePath, projectConfig) &&
    fileIsIncluded(fileEntry.filePath, projectConfig)
  );
}

/**
 * Reloads the specified HelmChart FileEntry and updates the name
 */

function reloadHelmChartFile(fileEntry: FileEntry, fileMap: FileMapType, helmChartMap: HelmChartMapType) {
  // find corresponding helmChart
  const helmChart = Object.values(helmChartMap).find(chart => chart.filePath === fileEntry.filePath);
  if (helmChart) {
    helmChart.name = getHelmChartName(getAbsoluteFilePath(fileEntry.filePath, fileMap));
  }
}

function reloadResourcesFromFileEntry(fileEntry: FileEntry, state: AppState, sideEffect: FileSideEffect) {
  const existingResourcesFromFile = getLocalResourceMetasForPath(
    fileEntry.filePath,
    state.resourceMetaMapByStorage.local
  );
  let wasAnyResourceSelected = false;

  const rootFolderPath = state.fileMap[ROOT_FILE_ENTRY].filePath;

  // delete old resources in file since we can't be sure the updated file contains the same resource(s)
  existingResourcesFromFile.forEach(resource => {
    if (
      state.selection?.type === 'resource' &&
      state.selection.resourceIdentifier.storage === 'local' &&
      state.selection.resourceIdentifier.id === resource.id
    ) {
      wasAnyResourceSelected = true;
    }
    deleteResource(resource, {
      resourceMetaMap: state.resourceMetaMapByStorage.local,
      resourceContentMap: state.resourceContentMapByStorage.local,
    });
  });

  if (state.selection?.type === 'file' && state.selection.filePath === fileEntry.filePath) {
    clearSelectionReducer(state);
  }

  // TODO: when resources from file are reloaded, they will have to be reprocessed by the validation listener

  const newResourcesFromFile = extractResourcesForFileEntry(fileEntry, rootFolderPath);
  newResourcesFromFile.forEach(resource => {
    sideEffect.affectedResourceIds.push(resource.id);
    const {meta, content} = splitK8sResource(resource);
    state.resourceMetaMapByStorage.local[meta.id] = meta;
    state.resourceContentMapByStorage.local[meta.id] = content;
  });

  if (wasAnyResourceSelected) {
    if (existingResourcesFromFile.length === 1 && newResourcesFromFile.length === 1) {
      const newResourceSelection: ResourceSelection = {
        type: 'resource',
        resourceIdentifier: {
          id: newResourcesFromFile[0].id,
          storage: 'local',
        },
      };
      selectResourceReducer(state, newResourceSelection);
    } else {
      clearSelectionReducer(state);
    }
  }
}

/**
 * Updates the fileEntry from the specified path - and its associated resources
 */

export function reloadFile(
  absolutePath: string,
  fileEntry: FileEntry,
  state: AppState,
  projectConfig: ProjectConfig,
  sideEffect: FileSideEffect
) {
  let absolutePathTimestamp = getFileTimestamp(absolutePath);

  if (fileEntry.timestamp && absolutePathTimestamp && absolutePathTimestamp <= fileEntry.timestamp) {
    log.info(`ignoring changed file ${absolutePath} because of timestamp`);
    return false;
  }

  // const fileStats = getFileStats(absolutePath);
  // if (fileStats && fileStats.isFile()) {
  //   fileEntry.text = fs.readFileSync(absolutePath, 'utf-8');
  // }
  fileEntry.timestamp = absolutePathTimestamp;
  let wasFileSelected = state.selection?.type === 'file' && state.selection.filePath === fileEntry.filePath;

  if (isHelmChartFile(absolutePath)) {
    reloadHelmChartFile(fileEntry, state.fileMap, state.helmChartMap);
  } else if (shouldReloadResourcesFromFile(fileEntry, projectConfig)) {
    reloadResourcesFromFileEntry(fileEntry, state, sideEffect);
  }

  if (wasFileSelected) {
    selectFileReducer(state, {filePath: fileEntry.filePath});
    state.selectionOptions.shouldEditorReload = true;
  }

  return true;
}

/**
 * Find the FileEntry for the parent folder of the specified path
 */

function findParentFolderEntry(absolutePath: string, fileMap: FileMapType) {
  const rootFolderEntry = fileMap[ROOT_FILE_ENTRY];
  const parentFolderAbsPath = path.dirname(absolutePath);
  let parentFolderEntry: FileEntry | undefined;

  if (parentFolderAbsPath === rootFolderEntry.filePath) {
    parentFolderEntry = rootFolderEntry;
  } else {
    const parentFolderRelPath = parentFolderAbsPath.substring(rootFolderEntry.filePath.length);
    const parentFolderEntryKey = Object.keys(fileMap).find(key => key === parentFolderRelPath);
    if (parentFolderEntryKey) {
      parentFolderEntry = fileMap[parentFolderEntryKey];
    }
  }
  return parentFolderEntry;
}

/**
 * Adds a new HelmValuesFile for the specified fileEntry
 */

function addHelmValuesFile(
  fileEntry: FileEntry,
  helmChartMap: HelmChartMapType,
  helmValuesMap: HelmValuesMapType,
  fileMap: FileMapType
) {
  const charts = findContainingHelmCharts(helmChartMap, fileEntry);

  if (charts.length > 0) {
    createHelmValuesFile({
      fileEntry,
      helmChart: charts[0],
      helmValuesMap,
      fileMap,
    });
    log.info(`Added values file at ${fileEntry.filePath} to helm chart ${charts[0].name}`);
  } else {
    log.warn(`Could not find Helm Chart for values file ${fileEntry.filePath}, ignoring..`);
  }
}

/**
 * Adds a HelmCart for the specified fileEntry
 */

function addHelmChartFile(
  fileEntry: FileEntry,
  absolutePath: string,
  fileMap: FileMapType,
  helmChartMap: HelmChartMapType,
  helmValuesMap: HelmValuesMapType
) {
  let parentFolderEntry = findParentFolderEntry(absolutePath, fileMap);
  if (parentFolderEntry) {
    const helmChart = createHelmChart(fileEntry, absolutePath, helmChartMap);

    parentFolderEntry.children?.forEach(fileName => {
      if (parentFolderEntry && isHelmValuesFile(fileName)) {
        const valuesFilePath =
          parentFolderEntry.filePath === fileMap[ROOT_FILE_ENTRY].filePath
            ? `${path.sep}${fileName}`
            : path.join(parentFolderEntry.filePath, fileName);

        const valuesFileEntry = fileMap[valuesFilePath];
        if (valuesFileEntry && helmChart) {
          createHelmValuesFile({
            fileEntry: valuesFileEntry,
            helmChart,
            helmValuesMap,
            fileMap,
          });
        }
      }
    });
  }
}

/**
 * Adds the file at the specified path with the specified parent - handles
 * Helm Charts/Values and regular resource files
 */

function addFile(absolutePath: string, state: AppState, projectConfig: ProjectConfig, sideEffect: FileSideEffect) {
  log.info(`adding file ${absolutePath}`);
  const rootFolderEntry = state.fileMap[ROOT_FILE_ENTRY];
  const relativePath = absolutePath.substring(rootFolderEntry.filePath.length);
  const extension = path.extname(absolutePath);
  const fileEntry = createFileEntry({fileEntryPath: relativePath, fileMap: state.fileMap, extension, projectConfig});

  if (!fileIsIncluded(fileEntry.filePath, projectConfig)) {
    return fileEntry;
  }

  // Add a Helm values file
  if (isHelmValuesFile(fileEntry.filePath)) {
    addHelmValuesFile(fileEntry, state.helmChartMap, state.helmValuesMap, state.fileMap);
  }
  // if this file is the Helm Chart entry file, create a new helm chart and add existing values files
  else if (isHelmChartFile(absolutePath)) {
    addHelmChartFile(fileEntry, absolutePath, state.fileMap, state.helmChartMap, state.helmValuesMap);
  }
  // seems to be a regular manifest file
  else {
    const resourcesFromFile = extractResourcesForFileEntry(fileEntry, rootFolderEntry.filePath);
    resourcesFromFile.forEach(resource => {
      sideEffect.affectedResourceIds.push(resource.id);
      const {meta, content} = splitK8sResource(resource);
      state.resourceMetaMapByStorage.local[meta.id] = meta;
      state.resourceContentMapByStorage.local[meta.id] = content;
    });
  }

  return fileEntry;
}

/**
 * Adds the folder at the specified path with the specified parent
 */

function addFolder(absolutePath: string, state: AppState, projectConfig: ProjectConfig, sideEffect: FileSideEffect) {
  log.info(`adding folder ${absolutePath}`);
  const rootFolder = state.fileMap[ROOT_FILE_ENTRY].filePath;
  if (absolutePath.startsWith(rootFolder)) {
    const folderEntry = createFileEntry({
      fileEntryPath: absolutePath.substring(rootFolder.length),
      fileMap: state.fileMap,
      extension: path.extname(absolutePath),
      projectConfig,
    });
    folderEntry.children = readFiles(
      absolutePath,
      {
        projectConfig,
        resourceMetaMap: state.resourceMetaMapByStorage.local,
        resourceContentMap: state.resourceContentMapByStorage.local,
        fileMap: state.fileMap,
        helmChartMap: state.helmChartMap,
        helmValuesMap: state.helmValuesMap,
        helmTemplatesMap: state.helmTemplatesMap,
      },
      undefined,
      undefined,
      sideEffect
    );
    return folderEntry;
  }

  log.error(`added folder ${absolutePath} is not under root ${rootFolder} - ignoring...`);
}

/**
 * Adds the file/folder at specified path - and its contained resources
 */

export function addPath(
  absolutePath: string,
  state: AppState,
  projectConfig: ProjectConfig,
  sideEffect: FileSideEffect
) {
  const parentPath = absolutePath.slice(0, absolutePath.lastIndexOf(path.sep));
  const parentEntry = getFileEntryForAbsolutePath(parentPath, state.fileMap);

  if (parentEntry) {
    let isDirectory: boolean;
    try {
      isDirectory = fs.statSync(absolutePath).isDirectory();
    } catch (err) {
      if (err instanceof Error) {
        log.warn(`[addPath]: ${err.message}`);
      }
      return undefined;
    }
    const fileEntry = isDirectory
      ? addFolder(absolutePath, state, projectConfig, sideEffect)
      : addFile(absolutePath, state, projectConfig, sideEffect);

    if (fileEntry) {
      parentEntry.children = parentEntry.children || [];
      parentEntry.children.push(fileEntry.name);
      parentEntry.children.sort();
    }

    return fileEntry;
  }
  log.warn(`Failed to find folder entry for ${absolutePath}, ignoring..`);

  return undefined;
}

/**
 * Removes the specified fileEntry and its resources from the provided state
 */

export function removeFile(fileEntry: FileEntry, state: AppState, removalSideEffect: PathRemovalSideEffect) {
  log.info(`removing file ${fileEntry.filePath}`);
  const resourcesForPath = getLocalResourceMetasForPath(fileEntry.filePath, state.resourceMetaMapByStorage.local);
  if (resourcesForPath.length > 0) {
    resourcesForPath.forEach(resource => {
      removalSideEffect.removedResources.push(resource);
      deleteResource(resource, {
        resourceMetaMap: state.resourceMetaMapByStorage.local,
        resourceContentMap: state.resourceContentMapByStorage.local,
      });
    });

    return;
  }

  const valuesFile = getHelmValuesFile(fileEntry, state.helmValuesMap);
  if (valuesFile) {
    if (state.helmValuesMap[valuesFile.id]) {
      removalSideEffect.removedHelmValuesFiles.push(valuesFile);
      delete state.helmValuesMap[valuesFile.id];

      const helmChart = state.helmChartMap[valuesFile.helmChartId];
      if (helmChart) {
        const valuesIndex = helmChart.valueFileIds.findIndex(id => valuesFile.id === id);
        if (valuesIndex !== -1) {
          helmChart.valueFileIds.splice(valuesIndex, 1);
        }
      }
    }

    return;
  }

  const chart = getHelmChartFromFileEntry(fileEntry, state.helmChartMap);
  if (chart) {
    if (state.helmChartMap[chart.id]) {
      removalSideEffect.removedHelmCharts.push(chart);
      const chartIdCopy = JSON.parse(JSON.stringify(chart.id));
      setImmediate(() => HelmChartEventEmitter.emit('remove', chartIdCopy));

      chart.valueFileIds.forEach(valueFileId => {
        const values = state.helmValuesMap[valueFileId];
        if (values) {
          removalSideEffect.removedHelmValuesFiles.push(values);
          delete state.helmValuesMap[valueFileId];
        }
      });

      delete state.helmChartMap[chart.id];
    }
  }
}

/**
 * Removes the specified fileEntry and its resources from the provided state
 */

function removeFolder(fileEntry: FileEntry, state: AppState, removalSideEffect: PathRemovalSideEffect) {
  log.info(`removing folder ${fileEntry.filePath}`);
  fileEntry.children?.forEach(child => {
    const childEntry = state.fileMap[path.join(fileEntry.filePath, child)];
    if (childEntry) {
      if (childEntry.children) {
        removeFolder(childEntry, state, removalSideEffect);
      } else {
        removeFile(childEntry, state, removalSideEffect);
      }
    }
  });
}

/**
 * Removes the FileEntry at the specified path - and its associated resources
 */

export function removePath(absolutePath: string, state: AppState, fileEntry: FileEntry) {
  delete state.fileMap[fileEntry.filePath];

  const removalSideEffect: PathRemovalSideEffect = {
    removedResources: [],
    removedHelmCharts: [],
    removedHelmValuesFiles: [],
  };

  if (fileEntry.children) {
    removeFolder(fileEntry, state, removalSideEffect);
  } else {
    removeFile(fileEntry, state, removalSideEffect);
  }

  if (state.selection?.type === 'file' && !state.fileMap[state.selection.filePath]) {
    clearSelectionReducer(state);
  } else if (
    state.selection?.type === 'resource' &&
    state.selection.resourceIdentifier.storage === 'local' &&
    !state.resourceMetaMapByStorage.local[state.selection.resourceIdentifier.id]
  ) {
    clearSelectionReducer(state);
  }

  // remove from parent
  const parentPath = path.dirname(absolutePath);
  const parentEntry = getFileEntryForAbsolutePath(parentPath, state.fileMap);
  if (parentEntry && parentEntry.children) {
    const ix = parentEntry.children.indexOf(fileEntry.name);
    if (ix >= 0) {
      parentEntry.children.splice(ix, 1);
    }
  }

  // TODO: clear refs from the removed file

  // TODO: reprocess kustomizations
}

/**
 * Highlights all resources in the specified file
 */

export function highlightResourcesFromFile({filePath, state}: {filePath: string; state: AppState}) {
  const entries = getAllFileEntriesForPath(filePath, state.fileMap);

  state.selection = undefined;
  state.selectionOptions = {};

  const highlights: AppSelection[] = [];

  if (entries.length > 0) {
    const parent = entries[entries.length - 1];
    getLocalResourceMetasForPath(parent.filePath, state.resourceMetaMapByStorage.local).forEach(r => {
      highlights.push({
        type: 'resource',
        resourceIdentifier: {
          id: r.id,
          storage: 'local',
        },
      });
    });

    if (parent.children) {
      const childrenHighlights = createChildrenResourcesHighlights(
        parent,
        state.resourceMetaMapByStorage.local,
        state.fileMap
      );
      highlights.push(...childrenHighlights);
    }
  }

  state.highlights = highlights;
}
