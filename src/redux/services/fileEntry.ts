import fs from 'fs';
import path from 'path';
import micromatch from 'micromatch';
import log from 'loglevel';
import {AppState, FileMapType, HelmChartMapType, HelmValuesMapType, ResourceMapType} from '@models/appstate';
import {AppConfig} from '@models/appconfig';
import {FileEntry} from '@models/fileentry';
import {K8sResource} from '@models/k8sresource';
import {ROOT_FILE_ENTRY} from '@constants/constants';
import {clearResourceSelections, updateSelectionAndHighlights} from '@redux/services/selection';
import {HelmChart, HelmValuesFile} from '@models/helm';
import {v4 as uuidv4} from 'uuid';
import {getFileStats} from '@utils/files';
import {parallelLimit} from 'async';

import {extractK8sResources, reprocessResources} from './resource';

type PathRemovalSideEffect = {
  removedResources: K8sResource[];
};

/**
 * Creates a FileEntry for the specified relative path
 */

export function createFileEntry(fileEntryPath: string) {
  const fileEntry: FileEntry = {
    name: fileEntryPath.substr(fileEntryPath.lastIndexOf(path.sep) + 1),
    filePath: fileEntryPath,
    isExcluded: false,
  };
  return fileEntry;
}

/**
 * Checks if the specified filename should be excluded per the global exclusion config
 */

function fileIsExcluded(appConfig: AppConfig, fileEntry: FileEntry) {
  return appConfig.scanExcludes.some(e => micromatch.isMatch(fileEntry.filePath, e));
}

/**
 * Checks if the specified files are a Helm Chart folder
 */

function isHelmChartFolder(files: string[]) {
  return files.indexOf('Chart.yaml') !== -1 && files.indexOf('values.yaml') !== -1;
}

/**
 * Processes the specified folder as containing a Helm Chart
 */

function processHelmChartFolder(
  folder: string,
  rootFolder: string,
  files: string[],
  appConfig: AppConfig,
  resourceMap: ResourceMapType,
  fileMap: FileMapType,
  helmChartMap: HelmChartMapType,
  helmValuesMap: HelmValuesMapType,
  result: string[],
  depth: number
) {
  const helmChart: HelmChart = {
    id: uuidv4(),
    filePath: path.join(folder, 'Chart.yaml').substr(rootFolder.length),
    name: folder.substr(folder.lastIndexOf(path.sep) + 1),
    valueFileIds: [],
  };

  parallelLimit(
    files.map(file => () => {
      const filePath = path.join(folder, file);
      const fileEntryPath = filePath.substr(rootFolder.length);
      const fileEntry = createFileEntry(fileEntryPath);

      if (fileIsExcluded(appConfig, fileEntry)) {
        fileEntry.isExcluded = true;
      } else if (getFileStats(filePath)?.isDirectory()) {
        if (depth === appConfig.folderReadsMaxDepth) {
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
      } else if (micromatch.isMatch(file, '*values*.yaml')) {
        const helmValues: HelmValuesFile = {
          id: uuidv4(),
          filePath: fileEntryPath,
          name: file,
          isSelected: false,
          helmChartId: helmChart.id,
        };

        helmValuesMap[helmValues.id] = helmValues;
        helmChart.valueFileIds.push(helmValues.id);
      }

      fileMap[fileEntry.filePath] = fileEntry;
      result.push(fileEntry.name);
    }),
    20,
    () => {}
  );

  helmChartMap[helmChart.id] = helmChart;
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
  depth: number = 1
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
    parallelLimit(
      files.map(file => () => {
        const filePath = path.join(folder, file);
        const fileEntryPath = filePath.substr(rootFolder.length);
        const fileEntry = createFileEntry(fileEntryPath);

        if (fileIsExcluded(appConfig, fileEntry)) {
          fileEntry.isExcluded = true;
        } else if (getFileStats(filePath)?.isDirectory()) {
          if (depth === appConfig.folderReadsMaxDepth) {
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
              resourceMap[resource.id] = resource;
            });
          } catch (e) {
            log.warn(`Failed to parse yaml in file ${fileEntry.name}; ${e}`);
          }
        }

        fileMap[fileEntry.filePath] = fileEntry;
        result.push(fileEntry.name);
      }),
      20,
      () => {}
    );
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
 * Returns the absolute path to the file that containing specified resource
 */

export function getAbsoluteResourcePath(resource: K8sResource, fileMap: FileMapType) {
  return path.join(fileMap[ROOT_FILE_ENTRY].filePath, resource.filePath);
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
  let absolutePathTimestamp: number | undefined;
  try {
    absolutePathTimestamp = fs.statSync(absolutePath).mtime.getTime();
  } catch (err) {
    if (err instanceof Error) {
      log.warn(`[reloadFile]: ${err.message}`);
    }
  }
  if (!fileEntry.timestamp || (absolutePathTimestamp && absolutePathTimestamp > fileEntry.timestamp)) {
    log.info(`updating from file ${absolutePath}`);

    const resourcesInFile = getResourcesForPath(fileEntry.filePath, state.resourceMap);
    let wasSelected = false;

    resourcesInFile.forEach(resource => {
      if (state.selectedResourceId === resource.id) {
        updateSelectionAndHighlights(state, resource);
        wasSelected = true;
      }
      delete state.resourceMap[resource.id];
    });

    if (state.selectedPath === fileEntry.filePath) {
      state.selectedPath = undefined;
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

    if (resourcesInFile.length === 1 && resourcesFromFile.length === 1 && wasSelected) {
      updateSelectionAndHighlights(state, resourcesFromFile[0]);
    }
  }
}

/**
 * Adds the file at the specified path with the specified parent
 */

function addFile(absolutePath: string, state: AppState) {
  log.info(`adding file ${absolutePath}`);
  let rootFolder = state.fileMap[ROOT_FILE_ENTRY].filePath;
  const fileEntry = createFileEntry(absolutePath.substr(rootFolder.length));
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
    const fileEntry = isDirectory ? addFolder(absolutePath, state, appConfig) : addFile(absolutePath, state);

    if (fileEntry) {
      state.fileMap[fileEntry.filePath] = fileEntry;

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

export function removeFile(fileEntry: FileEntry, state: AppState, removalSideEffect?: PathRemovalSideEffect) {
  log.info(`removing file ${fileEntry.filePath}`);
  getResourcesForPath(fileEntry.filePath, state.resourceMap).forEach(resource => {
    if (state.selectedResourceId === resource.id) {
      updateSelectionAndHighlights(state, resource);
    }
    if (removalSideEffect) {
      removalSideEffect.removedResources.push(resource);
    }
    delete state.resourceMap[resource.id];
  });
}

/**
 * Removes the specified fileEntry and its resources from the provided state
 */

function removeFolder(fileEntry: FileEntry, state: AppState, removalSideEffect?: PathRemovalSideEffect) {
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
  };

  if (fileEntry.children) {
    removeFolder(fileEntry, state, removalSideEffect);
  } else {
    removeFile(fileEntry, state, removalSideEffect);
  }

  if (state.selectedPath && !state.fileMap[state.selectedPath]) {
    state.selectedPath = undefined;
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

  reprocessResources([], state.resourceMap, state.fileMap, state.resourceRefsProcessingOptions, {
    resourceKinds: removalSideEffect.removedResources.map(r => r.kind),
  });
}
