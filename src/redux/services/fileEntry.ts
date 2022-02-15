import fs from 'fs';
import log from 'loglevel';
import micromatch from 'micromatch';
import path from 'path';
import {v4 as uuidv4} from 'uuid';

import {HELM_CHART_ENTRY_FILE, ROOT_FILE_ENTRY} from '@constants/constants';

import {AppConfig} from '@models/appconfig';
import {AppState, FileMapType, HelmChartMapType, HelmValuesMapType, ResourceMapType} from '@models/appstate';
import {FileEntry} from '@models/fileentry';
import {HelmChart, HelmValuesFile} from '@models/helm';
import {K8sResource} from '@models/k8sresource';

import {
  HelmChartEventEmitter,
  getHelmChartFromFileEntry,
  getHelmValuesFile,
  isHelmChartFolder,
  isHelmValuesFile,
  processHelmChartFolder,
} from '@redux/services/helm';
import {updateReferringRefsOnDelete} from '@redux/services/resourceRefs';
import {
  clearResourceSelections,
  highlightChildrenResources,
  updateSelectionAndHighlights,
} from '@redux/services/selection';

import {getFileStats, getFileTimestamp} from '@utils/files';

import {deleteResource, extractK8sResources, reprocessKustomizations, reprocessResources} from './resource';

type PathRemovalSideEffect = {
  removedResources: K8sResource[];
  removedHelmCharts: HelmChart[];
  removedHelmValuesFiles: HelmValuesFile[];
};

/**
 * Creates a FileEntry for the specified relative path
 */

export function createFileEntry(fileEntryPath: string) {
  const fileEntry: FileEntry = {
    name: fileEntryPath.substr(fileEntryPath.lastIndexOf(path.sep) + 1),
    filePath: fileEntryPath,
    isExcluded: false,
    isSupported: false,
  };
  return fileEntry;
}

/**
 * Checks if the specified filename should be excluded per the global exclusion config
 */

export function fileIsExcluded(appConfig: AppConfig, fileEntry: FileEntry) {
  const scanExcludes = appConfig.projectConfig?.scanExcludes || appConfig.scanExcludes;
  return scanExcludes.some(e => micromatch.isMatch(fileEntry.filePath, e));
}

/**
 * Returns the root folder for the specified fileMap
 */

export function getRootFolder(fileMap: FileMapType) {
  return fileMap && fileMap[ROOT_FILE_ENTRY] ? fileMap[ROOT_FILE_ENTRY].filePath : undefined;
}

/**
 * Recursively reads the provided folder in line with the provided appConfig and populates the
 * provided maps with found files and resources.
 *
 * Returns the list of filenames (not paths) found in the specified folder
 */

export function readFiles(
  folder: string,
  appConfig: AppConfig,
  resourceMap: ResourceMapType,
  fileMap: FileMapType,
  helmChartMap: HelmChartMapType,
  helmValuesMap: HelmValuesMapType,
  depth: number = 1,
  isSupportedResource: (resource: K8sResource) => boolean = () => true
) {
  const files = fs.readdirSync(folder);
  const result: string[] = [];

  // if there is no root entry assume this is the root folder (questionable..)
  if (!fileMap[ROOT_FILE_ENTRY]) {
    fileMap[ROOT_FILE_ENTRY] = createFileEntry(folder);
  }

  const rootFolder = fileMap[ROOT_FILE_ENTRY].filePath;

  // is this a helm chart folder?
  if (isHelmChartFolder(files)) {
    processHelmChartFolder(
      folder,
      rootFolder,
      files,
      appConfig,
      resourceMap,
      fileMap,
      helmChartMap,
      helmValuesMap,
      result,
      depth
    );
  } else {
    files.forEach(file => {
      const filePath = path.join(folder, file);
      const fileEntryPath = filePath.substr(rootFolder.length);
      const fileEntry = createFileEntry(fileEntryPath);
      fileEntry.timestamp = getFileTimestamp(filePath);

      if (fileIsExcluded(appConfig, fileEntry)) {
        fileEntry.isExcluded = true;
      } else if (getFileStats(filePath)?.isDirectory()) {
        const folderReadsMaxDepth = appConfig.projectConfig?.folderReadsMaxDepth || appConfig.folderReadsMaxDepth;
        if (depth === folderReadsMaxDepth) {
          log.warn(`[readFiles]: Ignored ${filePath} because max depth was reached.`);
        } else {
          fileEntry.children = readFiles(
            filePath,
            appConfig,
            resourceMap,
            fileMap,
            helmChartMap,
            helmValuesMap,
            depth + 1
          );
        }
      } else if (appConfig.fileIncludes.some(e => micromatch.isMatch(fileEntry.name, e))) {
        try {
          extractK8sResourcesFromFile(filePath, fileMap).forEach(resource => {
            if (!isSupportedResource(resource)) {
              fileEntry.isSupported = false;
              return;
            }

            resourceMap[resource.id] = resource;
          });
        } catch (e) {
          log.warn(`Failed to parse yaml in file ${fileEntry.name}; ${e}`);
        }

        fileEntry.isSupported = true;
      }

      fileMap[fileEntry.filePath] = fileEntry;
      result.push(fileEntry.name);
    });
  }

  return result;
}

/**
 * Returns all resources associated with the specified path
 */

export function getResourcesForPath(filePath: string, resourceMap: ResourceMapType) {
  return Object.values(resourceMap).filter(r => r.filePath === filePath);
}

/**
 * Returns the absolute path to the folder containing the file containing the
 * specified resource
 */

export function getAbsoluteResourceFolder(resource: K8sResource, fileMap: FileMapType) {
  return path.join(
    fileMap[ROOT_FILE_ENTRY].filePath,
    resource.filePath.substr(0, resource.filePath.lastIndexOf(path.sep))
  );
}

/**
 * Returns the relative path to the folder containing the file containing the
 * specified resource
 */

export function getResourceFolder(resource: K8sResource) {
  return resource.filePath.substr(0, resource.filePath.lastIndexOf('/'));
}

/**
 * Returns the absolute path to the file that containing specified resource
 */

export function getAbsoluteResourcePath(resource: K8sResource, fileMap: FileMapType) {
  return path.join(fileMap[ROOT_FILE_ENTRY].filePath, resource.filePath);
}

/**
 * Returns the absolute path to the file that containing specified resource
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

export function extractK8sResourcesFromFile(filePath: string, fileMap: FileMapType): K8sResource[] {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const rootEntry = fileMap[ROOT_FILE_ENTRY];
  return extractK8sResources(fileContent, rootEntry ? filePath.substr(rootEntry.filePath.length) : filePath);
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
  return filePath.startsWith(rootFolder) ? fileMap[filePath.substr(rootFolder.length)] : undefined;
}

/**
 * Updates the fileEntry from the specified path - and its associated resources
 */

export function reloadFile(absolutePath: string, fileEntry: FileEntry, state: AppState) {
  let absolutePathTimestamp = getFileTimestamp(absolutePath);

  if (!fileEntry.timestamp || (absolutePathTimestamp && absolutePathTimestamp > fileEntry.timestamp)) {
    fileEntry.timestamp = absolutePathTimestamp;

    let wasFileSelected = state.selectedPath === fileEntry.filePath;

    const resourcesInFile = getResourcesForPath(fileEntry.filePath, state.resourceMap);
    let wasAnyResourceSelected = false;

    // delete old resources in file since we can't be sure the updated file contains the same resource(s)
    resourcesInFile.forEach(resource => {
      if (state.selectedResourceId === resource.id) {
        updateSelectionAndHighlights(state, resource);
        wasAnyResourceSelected = true;
      }
      deleteResource(resource, state.resourceMap);
    });

    if (state.selectedPath === fileEntry.filePath) {
      state.selectedPath = undefined;
      state.selectedResourceId = undefined;
      clearResourceSelections(state.resourceMap);
    }

    const resourcesFromFile = extractK8sResourcesFromFile(absolutePath, state.fileMap);
    resourcesFromFile.forEach(resource => {
      state.resourceMap[resource.id] = resource;
    });

    reprocessResources(
      resourcesFromFile.map(r => r.id),
      state.resourceMap,
      state.fileMap,
      state.resourceRefsProcessingOptions
    );

    if (wasAnyResourceSelected) {
      if (resourcesInFile.length === 1 && resourcesFromFile.length === 1) {
        updateSelectionAndHighlights(state, resourcesFromFile[0]);
      } else {
        state.selectedPath = undefined;
        state.selectedResourceId = undefined;
        clearResourceSelections(state.resourceMap);
      }
    }

    if (wasFileSelected) {
      selectFilePath(fileEntry.filePath, state);
      state.shouldEditorReloadSelectedPath = true;
    }
  } else {
    log.info(`ignoring changed file ${absolutePath} because of timestamp`);
  }
}

/**
 * Adds the file at the specified path with the specified parent
 */

function addFile(absolutePath: string, state: AppState, appConfig: AppConfig) {
  log.info(`adding file ${absolutePath}`);
  const rootFolderEntry = state.fileMap[ROOT_FILE_ENTRY];
  const relativePath = absolutePath.substr(rootFolderEntry.filePath.length);
  const fileEntry = createFileEntry(relativePath);

  if (!appConfig.fileIncludes.some(e => micromatch.isMatch(fileEntry.name, e))) {
    return fileEntry;
  }
  fileEntry.isSupported = true;

  const resourcesFromFile = extractK8sResourcesFromFile(absolutePath, state.fileMap);
  resourcesFromFile.forEach(resource => {
    state.resourceMap[resource.id] = resource;
  });
  reprocessResources(
    resourcesFromFile.map(r => r.id),
    state.resourceMap,
    state.fileMap,
    state.resourceRefsProcessingOptions
  );

  const parentFolderAbsPath = path.dirname(absolutePath);
  let parentFolderEntry: FileEntry | undefined;

  if (parentFolderAbsPath === rootFolderEntry.filePath) {
    parentFolderEntry = rootFolderEntry;
  } else {
    const parentFolderRelPath = parentFolderAbsPath.substring(rootFolderEntry.filePath.length);
    const parentFolderEntryKey = Object.keys(state.fileMap).find(key => key === parentFolderRelPath);
    if (parentFolderEntryKey) {
      parentFolderEntry = state.fileMap[parentFolderEntryKey];
    }
  }

  // if this file is the Helm Chart entry file, create a new helm chart and search for exising values files
  const isHelmChartFile = path.basename(absolutePath) === HELM_CHART_ENTRY_FILE;
  if (isHelmChartFile) {
    const helmChart: HelmChart = {
      id: uuidv4(),
      filePath: fileEntry.filePath,
      name: parentFolderAbsPath.trim() !== '' ? path.basename(parentFolderAbsPath) : 'Unnamed Chart',
      valueFileIds: [],
    };
    state.helmChartMap[helmChart.id] = helmChart;
    HelmChartEventEmitter.emit('create', helmChart);

    parentFolderEntry?.children?.forEach(fileName => {
      if (!parentFolderEntry) {
        return;
      }
      if (isHelmValuesFile(fileName)) {
        const valuesFilePath =
          parentFolderEntry.filePath === rootFolderEntry.filePath
            ? `${path.sep}${fileName}`
            : path.join(parentFolderEntry.filePath, fileName);
        const helmValuesFile: HelmValuesFile = {
          id: uuidv4(),
          filePath: valuesFilePath,
          name: fileName,
          isSelected: false,
          helmChartId: helmChart.id,
        };
        helmChart.valueFileIds.push(helmValuesFile.id);
        state.helmValuesMap[helmValuesFile.id] = helmValuesFile;
      }
    });
  }

  // if this new file is a values file, search for it's helm chart and update it
  if (isHelmValuesFile(absolutePath)) {
    const helmChart = Object.values(state.helmChartMap).find(chart => {
      return path.dirname(chart.filePath) === parentFolderEntry?.filePath;
    });
    if (helmChart) {
      const helmValuesFile: HelmValuesFile = {
        id: uuidv4(),
        filePath: relativePath,
        name: path.basename(relativePath),
        isSelected: false,
        helmChartId: helmChart.id,
      };
      state.helmValuesMap[helmValuesFile.id] = helmValuesFile;
      helmChart.valueFileIds.push(helmValuesFile.id);
    }
  }

  return fileEntry;
}

/**
 * Adds the folder at the specified path with the specified parent
 */

function addFolder(absolutePath: string, state: AppState, appConfig: AppConfig) {
  log.info(`adding folder ${absolutePath}`);
  const rootFolder = state.fileMap[ROOT_FILE_ENTRY].filePath;
  if (absolutePath.startsWith(rootFolder)) {
    const folderEntry = createFileEntry(absolutePath.substr(rootFolder.length));
    folderEntry.children = readFiles(
      absolutePath,
      appConfig,
      state.resourceMap,
      state.fileMap,
      state.helmChartMap,
      state.helmValuesMap
    );
    return folderEntry;
  }

  log.error(`added folder ${absolutePath} is not under root ${rootFolder} - ignoring...`);
}

/**
 * Adds the file/folder at specified path - and its contained resources
 */

export function addPath(absolutePath: string, state: AppState, appConfig: AppConfig) {
  const parentPath = absolutePath.substr(0, absolutePath.lastIndexOf(path.sep));
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
    const fileEntry = isDirectory ? addFolder(absolutePath, state, appConfig) : addFile(absolutePath, state, appConfig);

    if (fileEntry) {
      state.fileMap[fileEntry.filePath] = fileEntry;

      parentEntry.children = parentEntry.children || [];
      parentEntry.children.push(fileEntry.name);
      parentEntry.children.sort();
    }

    reprocessKustomizations(state.resourceMap, state.fileMap);

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
  getResourcesForPath(fileEntry.filePath, state.resourceMap).forEach(resource => {
    removalSideEffect.removedResources.push(resource);
    deleteResource(resource, state.resourceMap);
  });

  const valuesFile = getHelmValuesFile(fileEntry, state.helmValuesMap);
  if (valuesFile) {
    removalSideEffect.removedHelmValuesFiles.push(valuesFile);
    if (state.helmValuesMap[valuesFile.id]) {
      delete state.helmValuesMap[valuesFile.id];
    }
    Object.values(state.helmChartMap).forEach(helmChart => {
      const valuesIndex = helmChart.valueFileIds.findIndex(id => valuesFile.id === id);
      if (valuesIndex !== -1) {
        helmChart.valueFileIds.splice(valuesIndex, 1);
      }
    });
  }

  const chart = getHelmChartFromFileEntry(fileEntry, state.helmChartMap);
  if (chart) {
    removalSideEffect.removedHelmCharts.push(chart);
    if (state.helmChartMap[chart.id]) {
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

  if (state.selectedPath && !state.fileMap[state.selectedPath]) {
    state.selectedPath = undefined;
    clearResourceSelections(state.resourceMap);
  } else if (state.selectedResourceId && !state.resourceMap[state.selectedResourceId]) {
    state.selectedResourceId = undefined;
    clearResourceSelections(state.resourceMap);
  }

  // remove from parent
  const parentPath = absolutePath.substr(0, absolutePath.lastIndexOf(path.sep));
  const parentEntry = getFileEntryForAbsolutePath(parentPath, state.fileMap);
  if (parentEntry && parentEntry.children) {
    const ix = parentEntry.children.indexOf(fileEntry.name);
    if (ix >= 0) {
      parentEntry.children.splice(ix, 1);
    }
  }

  // clear refs
  removalSideEffect.removedResources.forEach(r => updateReferringRefsOnDelete(r, state.resourceMap));
}

/**
 * Selects the specified filePath - used by several reducers
 */

export function selectFilePath(filePath: string, state: AppState) {
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
