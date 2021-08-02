import fs from 'fs';
import path from 'path';
import micromatch from 'micromatch';
import log from 'loglevel';
import {AppState, FileMapType, HelmChartMapType, HelmValuesMapType, ResourceMapType} from '@models/appstate';
import {AppConfig} from '@models/appconfig';
import {FileEntry} from '@models/fileentry';
import {K8sResource} from '@models/k8sresource';
import {ROOT_FILE_ENTRY} from '@src/constants';
import {clearResourceSelections, updateSelectionAndHighlights} from '@redux/utils/selection';
import {HelmChart, HelmValuesFile} from '@models/helm';
import {v4 as uuidv4} from 'uuid';
import {extractK8sResources, reprocessResources} from './resource';

/**
 * Creates a FileEntry for the specified relative path
 */

export function createFileEntry(fileEntryPath: string) {
  const fileEntry: FileEntry = {
    name: fileEntryPath.substr(fileEntryPath.lastIndexOf(path.sep) + 1),
    filePath: fileEntryPath,
    highlight: false,
    selected: false,
    expanded: false,
    excluded: false,
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
  helmValuesMap: HelmValuesMapType
) {
  const files = fs.readdirSync(folder);
  const result: string[] = [];

  // if there is no root entry assume this is the root folder (questionable..)
  if (!fileMap[ROOT_FILE_ENTRY]) {
    fileMap[ROOT_FILE_ENTRY] = createFileEntry(folder);
  }

  const rootFolder = fileMap[ROOT_FILE_ENTRY].filePath;

  // is this a helm chart folder?
  if (files.indexOf('Chart.yaml') !== -1 && files.indexOf('values.yaml') !== -1) {
    const helmChart: HelmChart = {
      id: uuidv4(),
      filePath: path.join(folder, 'Chart.yaml').substr(rootFolder.length),
      name: folder.substr(folder.lastIndexOf(path.sep) + 1),
      valueFiles: [],
    };

    files.forEach(file => {
      const filePath = path.join(folder, file);
      const fileEntryPath = filePath.substr(rootFolder.length);
      const fileEntry = createFileEntry(fileEntryPath);

      if (fileIsExcluded(appConfig, fileEntry)) {
        fileEntry.excluded = true;
      } else if (fs.statSync(filePath).isDirectory()) {
        fileEntry.children = readFiles(filePath, appConfig, resourceMap, fileMap, helmChartMap, helmValuesMap);
      } else if (micromatch.isMatch(file, '*values*.yaml')) {
        const helmValues: HelmValuesFile = {
          id: uuidv4(),
          filePath: fileEntryPath,
          name: file,
          selected: false,
          helmChart: helmChart.id,
        };

        helmValuesMap[helmValues.id] = helmValues;
        helmChart.valueFiles.push(helmValues.id);
      }

      fileMap[fileEntry.filePath] = fileEntry;
      result.push(fileEntry.name);
    });

    helmChartMap[helmChart.id] = helmChart;
  } else {
    files.forEach(file => {
      const filePath = path.join(folder, file);
      const fileEntryPath = filePath.substr(rootFolder.length);
      const fileEntry = createFileEntry(fileEntryPath);

      if (fileIsExcluded(appConfig, fileEntry)) {
        fileEntry.excluded = true;
      } else if (fs.statSync(filePath).isDirectory()) {
        fileEntry.children = readFiles(filePath, appConfig, resourceMap, fileMap, helmChartMap, helmValuesMap);
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
    });
  }

  return result;
}

async function readDirectoryAsync(directory: string) {
  return new Promise<string[]>((resolve, reject) => {
    fs.readdir(directory, (err, files) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(files);
    });
  });
}

export async function readFilesAsync(
  folder: string,
  appConfig: AppConfig,
  resourceMap: ResourceMapType,
  fileMap: FileMapType,
  helmChartMap: HelmChartMapType,
  helmValuesMap: HelmValuesMapType
) {
  /* eslint-disable no-await-in-loop */
  const files = await readDirectoryAsync(folder);
  const result: string[] = [];

  // if there is no root entry assume this is the root folder (questionable..)
  if (!fileMap[ROOT_FILE_ENTRY]) {
    fileMap[ROOT_FILE_ENTRY] = createFileEntry(folder);
  }

  const rootFolder = fileMap[ROOT_FILE_ENTRY].filePath;

  // is this a helm chart folder?
  if (files.indexOf('Chart.yaml') !== -1 && files.indexOf('values.yaml') !== -1) {
    const helmChart: HelmChart = {
      id: uuidv4(),
      filePath: path.join(folder, 'Chart.yaml').substr(rootFolder.length),
      name: folder.substr(folder.lastIndexOf(path.sep) + 1),
      valueFiles: [],
    };

    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
      const filePath = path.join(folder, file);
      const fileEntryPath = filePath.substr(rootFolder.length);
      const fileEntry = createFileEntry(fileEntryPath);

      if (fileIsExcluded(appConfig, fileEntry)) {
        fileEntry.excluded = true;
      } else if (fs.statSync(filePath).isDirectory()) {
        fileEntry.children = await readFilesAsync(
          filePath,
          appConfig,
          resourceMap,
          fileMap,
          helmChartMap,
          helmValuesMap
        );
      } else if (micromatch.isMatch(file, '*values*.yaml')) {
        const helmValues: HelmValuesFile = {
          id: uuidv4(),
          filePath: fileEntryPath,
          name: file,
          selected: false,
          helmChart: helmChart.id,
        };

        helmValuesMap[helmValues.id] = helmValues;
        helmChart.valueFiles.push(helmValues.id);
      }

      fileMap[fileEntry.filePath] = fileEntry;
      result.push(fileEntry.name);
    }

    helmChartMap[helmChart.id] = helmChart;
  } else {
    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
      const filePath = path.join(folder, file);
      const fileEntryPath = filePath.substr(rootFolder.length);
      const fileEntry = createFileEntry(fileEntryPath);

      if (fileIsExcluded(appConfig, fileEntry)) {
        fileEntry.excluded = true;
      } else if (fs.statSync(filePath).isDirectory()) {
        fileEntry.children = await readFilesAsync(
          filePath,
          appConfig,
          resourceMap,
          fileMap,
          helmChartMap,
          helmValuesMap
        );
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
    }
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
 * Extracts all resources from the file at the specified path
 */

export function extractK8sResourcesFromFile(filePath: string, fileMap: FileMapType) {
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
  if (!fileEntry.timestamp || fs.statSync(absolutePath).mtime.getTime() > fileEntry.timestamp) {
    log.info(`updating from file ${absolutePath}`);

    const resourcesInFile = getResourcesForPath(fileEntry.filePath, state.resourceMap);
    let wasSelected = false;

    resourcesInFile.forEach(resource => {
      if (state.selectedResource === resource.id) {
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

    reprocessResources([], state.resourceMap, state.fileMap);

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
  extractK8sResourcesFromFile(absolutePath, state.fileMap).forEach(resource => {
    state.resourceMap[resource.id] = resource;
  });

  return fileEntry;
}

/**
 * Adds the folder at the specified path with the specified parent
 */

function addFolder(absolutePath: string, state: AppState) {
  log.info(`adding folder ${absolutePath}`);
  const rootFolder = state.fileMap[ROOT_FILE_ENTRY].filePath;
  if (absolutePath.startsWith(rootFolder)) {
    const folderEntry = createFileEntry(absolutePath.substr(rootFolder.length));
    folderEntry.children = readFiles(
      absolutePath,
      state.appConfig,
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

export function addPath(absolutePath: string, state: AppState) {
  const parentPath = absolutePath.substr(0, absolutePath.lastIndexOf(path.sep));
  const parentEntry = getFileEntryForAbsolutePath(parentPath, state.fileMap);

  if (parentEntry) {
    const fileEntry = fs.statSync(absolutePath).isDirectory()
      ? addFolder(absolutePath, state)
      : addFile(absolutePath, state);

    if (fileEntry) {
      state.fileMap[fileEntry.filePath] = fileEntry;

      parentEntry.children = parentEntry.children || [];
      parentEntry.children.push(fileEntry.name);

      reprocessResources([], state.resourceMap, state.fileMap);
    }

    return fileEntry;
  }
  log.warn(`Failed to find folder entry for ${absolutePath}, ignoring..`);

  return undefined;
}

/**
 * Removes the specified fileEntry and its resources from the provided state
 */

function removeFile(fileEntry: FileEntry, state: AppState) {
  log.info(`removing file ${fileEntry.filePath}`);
  getResourcesForPath(fileEntry.filePath, state.resourceMap).forEach(resource => {
    if (state.selectedResource === resource.id) {
      updateSelectionAndHighlights(state, resource);
    }
    delete state.resourceMap[resource.id];
  });
}

/**
 * Removes the specified fileEntry and its resources from the provided state
 */

function removeFolder(fileEntry: FileEntry, state: AppState) {
  log.info(`removing folder ${fileEntry.filePath}`);
  fileEntry.children?.forEach(child => {
    const childEntry = state.fileMap[path.join(fileEntry.filePath, child)];
    if (childEntry) {
      if (childEntry.children) {
        removeFolder(childEntry, state);
      } else {
        removeFile(childEntry, state);
      }
    }
  });
}

/**
 * Removes the FileEntry at the specified path - and its associated resources
 */

export function removePath(absolutePath: string, state: AppState, fileEntry: FileEntry) {
  delete state.fileMap[fileEntry.filePath];

  if (fileEntry.children) {
    removeFolder(fileEntry, state);
  } else {
    removeFile(fileEntry, state);
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

  reprocessResources([], state.resourceMap, state.fileMap);
}
