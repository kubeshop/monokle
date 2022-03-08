import fs from 'fs';
import log from 'loglevel';
import micromatch from 'micromatch';
import path from 'path';

import {ROOT_FILE_ENTRY} from '@constants/constants';

import {ProjectConfig} from '@models/appconfig';
import {AppState, FileMapType, HelmChartMapType, HelmValuesMapType, ResourceMapType} from '@models/appstate';
import {FileEntry} from '@models/fileentry';
import {HelmChart, HelmValuesFile} from '@models/helm';
import {K8sResource} from '@models/k8sresource';

import {
  HelmChartEventEmitter,
  createHelmChart,
  createHelmValuesFile,
  getHelmChartFromFileEntry,
  getHelmChartName,
  getHelmValuesFile,
  isHelmChartFile,
  isHelmChartFolder,
  isHelmValuesFile,
  processHelmChartFolder,
} from '@redux/services/helm';
import {getK8sVersion} from '@redux/services/projectConfig';
import {updateReferringRefsOnDelete} from '@redux/services/resourceRefs';
import {
  clearResourceSelections,
  highlightChildrenResources,
  updateSelectionAndHighlights,
} from '@redux/services/selection';

import {getFileStats, getFileTimestamp} from '@utils/files';

import {
  deleteResource,
  extractK8sResources,
  hasSupportedResourceContent,
  reprocessKustomizations,
  reprocessResources,
} from './resource';

type PathRemovalSideEffect = {
  removedResources: K8sResource[];
  removedHelmCharts: HelmChart[];
  removedHelmValuesFiles: HelmValuesFile[];
};

/**
 * Creates a FileEntry for the specified relative path
 */

export function createFileEntry(fileEntryPath: string, fileMap: FileMapType) {
  const fileEntry: FileEntry = {
    name: path.basename(fileEntryPath),
    filePath: fileEntryPath,
    isExcluded: false,
    isSupported: false,
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
    isExcluded: false,
    isSupported: false,
  };
  fileMap[ROOT_FILE_ENTRY] = rootEntry;
  return rootEntry;
}

/**
 * Checks if the specified filename should be excluded per the project exclusion config
 */

export function fileIsExcluded(fileEntry: FileEntry, projectConfig: ProjectConfig) {
  return projectConfig.scanExcludes?.some(e => micromatch.isMatch(fileEntry.filePath, e));
}

/**
 * Checks if the specified filename should be excluded per the project inclusion config
 */

export function fileIsIncluded(fileEntry: FileEntry, projectConfig: ProjectConfig) {
  return projectConfig.fileIncludes?.some(e => micromatch.isMatch(path.basename(fileEntry.filePath), e));
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

export function extractResourcesForFileEntry(fileEntry: FileEntry, fileMap: FileMapType, resourceMap: ResourceMapType) {
  const result: K8sResource[] = [];

  try {
    fileEntry.isSupported = true;
    extractK8sResourcesFromFile(getAbsoluteFilePath(fileEntry.filePath, fileMap), fileMap).forEach(resource => {
      if (!hasSupportedResourceContent(resource)) {
        fileEntry.isSupported = false;
        return;
      }

      resourceMap[resource.id] = resource;
      result.push(resource);
    });
  } catch (e) {
    fileEntry.isSupported = false;
    log.warn(`Failed to parse yaml in file ${fileEntry.name}; ${e}`);
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
  projectConfig: ProjectConfig,
  resourceMap: ResourceMapType,
  fileMap: FileMapType,
  helmChartMap: HelmChartMapType,
  helmValuesMap: HelmValuesMapType,
  depth: number = 1,
  helmChart?: HelmChart
) {
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
        projectConfig,
        resourceMap,
        fileMap,
        helmChartMap,
        helmValuesMap,
        depth
      )
    );
  } else {
    files.forEach(file => {
      const filePath = path.join(folder, file);
      const fileEntryPath = filePath.substring(rootFolder.length);
      const fileEntry = createFileEntry(fileEntryPath, fileMap);

      if (fileIsExcluded(fileEntry, projectConfig)) {
        fileEntry.isExcluded = true;
      } else if (getFileStats(filePath)?.isDirectory()) {
        const folderReadsMaxDepth = projectConfig.folderReadsMaxDepth;
        if (depth === folderReadsMaxDepth) {
          log.warn(`[readFiles]: Ignored ${filePath} because max depth was reached.`);
        } else {
          fileEntry.children = readFiles(
            filePath,
            projectConfig,
            resourceMap,
            fileMap,
            helmChartMap,
            helmValuesMap,
            depth + 1
          );
        }
      } else if (helmChart && isHelmValuesFile(fileEntry.name)) {
        createHelmValuesFile(fileEntry, helmChart, helmValuesMap);
      } else if (fileIsIncluded(fileEntry, projectConfig)) {
        extractResourcesForFileEntry(fileEntry, fileMap, resourceMap);
      }

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
 * Checks if the specified file should be reloaded based on project configuration
 */

function shouldReloadResourcesFromFile(fileEntry: FileEntry, projectConfig: ProjectConfig) {
  return (
    !isHelmValuesFile(fileEntry.filePath) &&
    !fileIsExcluded(fileEntry, projectConfig) &&
    fileIsIncluded(fileEntry, projectConfig)
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

function reloadResourcesFromFileEntry(
  fileEntry: FileEntry,
  state: AppState,
  schemaVersion: string,
  userDataDir: string
) {
  const existingResourcesFromFile = getResourcesForPath(fileEntry.filePath, state.resourceMap);
  let wasAnyResourceSelected = false;

  // delete old resources in file since we can't be sure the updated file contains the same resource(s)
  existingResourcesFromFile.forEach(resource => {
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

  const newResourcesFromFile = extractResourcesForFileEntry(fileEntry, state.fileMap, state.resourceMap);
  if (newResourcesFromFile.length > 0) {
    reprocessResources(
      schemaVersion,
      userDataDir,
      newResourcesFromFile.map(r => r.id),
      state.resourceMap,
      state.fileMap,
      state.resourceRefsProcessingOptions
    );
  }

  if (wasAnyResourceSelected) {
    if (existingResourcesFromFile.length === 1 && newResourcesFromFile.length === 1) {
      updateSelectionAndHighlights(state, newResourcesFromFile[0]);
    } else {
      state.selectedPath = undefined;
      state.selectedResourceId = undefined;
      clearResourceSelections(state.resourceMap);
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
  userDataDir: string
) {
  let absolutePathTimestamp = getFileTimestamp(absolutePath);

  if (fileEntry.timestamp && absolutePathTimestamp && absolutePathTimestamp <= fileEntry.timestamp) {
    log.info(`ignoring changed file ${absolutePath} because of timestamp`);
    return;
  }

  fileEntry.timestamp = absolutePathTimestamp;
  let wasFileSelected = state.selectedPath === fileEntry.filePath;

  if (isHelmChartFile(absolutePath)) {
    reloadHelmChartFile(fileEntry, state.fileMap, state.helmChartMap);
  } else if (shouldReloadResourcesFromFile(fileEntry, projectConfig)) {
    reloadResourcesFromFileEntry(fileEntry, state, getK8sVersion(projectConfig), userDataDir);
  }

  if (wasFileSelected) {
    selectFilePath(fileEntry.filePath, state);
    state.shouldEditorReloadSelectedPath = true;
  }
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

function addHelmValuesFile(fileEntry: FileEntry, helmChartMap: HelmChartMapType, helmValuesMap: HelmValuesMapType) {
  // find helm chart containing this file - take subcharts into account
  const charts = Object.values(helmChartMap)
    .filter(chart => fileEntry.filePath.startsWith(path.dirname(chart.filePath)))
    .sort((chart1: HelmChart, chart2: HelmChart) => {
      // sort by path -> longest path must be the most immediate parent
      return chart2.filePath.length - chart1.filePath.length;
    });

  if (charts.length > 0) {
    createHelmValuesFile(fileEntry, charts[0], helmValuesMap);
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
        if (valuesFileEntry) {
          createHelmValuesFile(valuesFileEntry, helmChart, helmValuesMap);
        }
      }
    });
  }
}

/**
 * Adds the file at the specified path with the specified parent - handles
 * Helm Charts/Values and regular resource files
 */

function addFile(absolutePath: string, state: AppState, projectConfig: ProjectConfig, userDataDir: string) {
  log.info(`adding file ${absolutePath}`);
  const rootFolderEntry = state.fileMap[ROOT_FILE_ENTRY];
  const relativePath = absolutePath.substring(rootFolderEntry.filePath.length);
  const fileEntry = createFileEntry(relativePath, state.fileMap);

  if (!fileIsIncluded(fileEntry, projectConfig)) {
    return fileEntry;
  }

  // Add a Helm values file
  if (isHelmValuesFile(fileEntry.filePath)) {
    addHelmValuesFile(fileEntry, state.helmChartMap, state.helmValuesMap);
  }
  // if this file is the Helm Chart entry file, create a new helm chart and add existing values files
  else if (isHelmChartFile(absolutePath)) {
    addHelmChartFile(fileEntry, absolutePath, state.fileMap, state.helmChartMap, state.helmValuesMap);
  }
  // seems to be a regular manifest file
  else {
    const resourcesFromFile = extractResourcesForFileEntry(fileEntry, state.fileMap, state.resourceMap);
    if (resourcesFromFile.length > 0) {
      reprocessResources(
        getK8sVersion(projectConfig),
        userDataDir,
        resourcesFromFile.map(r => r.id),
        state.resourceMap,
        state.fileMap,
        state.resourceRefsProcessingOptions
      );
    }
  }

  return fileEntry;
}

/**
 * Adds the folder at the specified path with the specified parent
 */

function addFolder(absolutePath: string, state: AppState, projectConfig: ProjectConfig) {
  log.info(`adding folder ${absolutePath}`);
  const rootFolder = state.fileMap[ROOT_FILE_ENTRY].filePath;
  if (absolutePath.startsWith(rootFolder)) {
    const folderEntry = createFileEntry(absolutePath.substring(rootFolder.length), state.fileMap);
    folderEntry.children = readFiles(
      absolutePath,
      projectConfig,
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

export function addPath(absolutePath: string, state: AppState, projectConfig: ProjectConfig, userDataDir: string) {
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
    const fileEntry = isDirectory
      ? addFolder(absolutePath, state, projectConfig)
      : addFile(absolutePath, state, projectConfig, userDataDir);

    if (fileEntry) {
      parentEntry.children = parentEntry.children || [];
      parentEntry.children.push(fileEntry.name);
      parentEntry.children.sort();
    }

    // reprocess since the added fileEntry might be included by a kustomization
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
  const resourcesForPath = getResourcesForPath(fileEntry.filePath, state.resourceMap);
  if (resourcesForPath.length > 0) {
    resourcesForPath.forEach(resource => {
      removalSideEffect.removedResources.push(resource);
      deleteResource(resource, state.resourceMap);
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

  if (state.selectedPath && !state.fileMap[state.selectedPath]) {
    state.selectedPath = undefined;
    clearResourceSelections(state.resourceMap);
  } else if (state.selectedResourceId && !state.resourceMap[state.selectedResourceId]) {
    state.selectedResourceId = undefined;
    clearResourceSelections(state.resourceMap);
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

  // clear refs
  removalSideEffect.removedResources.forEach(r => updateReferringRefsOnDelete(r, state.resourceMap));

  // update kustomizations
  reprocessKustomizations(state.resourceMap, state.fileMap);
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
  state.selectedPreviewConfigurationId = undefined;
  state.selectedPath = filePath;
}
