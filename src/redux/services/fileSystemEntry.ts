import fs from 'fs';
import path from 'path';
import micromatch from 'micromatch';
import log from 'loglevel';
import {AppState, HelmChartMapType, HelmValuesMapType, ResourceMapType} from '@models/appstate';
import {AppConfig} from '@models/appconfig';
import {
  FileSystemEntry,
  FileSystemEntryMap,
  FileEntry,
  FolderEntry,
  RootEntry,
  RootOrFileSystemEntry,
} from '@models/filesystementry';
import {K8sResource} from '@models/k8sresource';
import {clearResourceSelections, updateSelectionAndHighlights} from '@redux/services/selection';
import {HelmChart, HelmValuesFile} from '@models/helm';
import {v4 as uuidv4} from 'uuid';
import {extractK8sResources, reprocessResources} from './resource';

export function getNameFromFilePath(filePath: string) {
  return filePath.substr(filePath.lastIndexOf(path.sep) + 1);
}

/**
 * Creates a FileEntry for the specified relative path
 */

export function createFileSystemEntry(rootEntry: RootEntry, fsEntryRelPath: string): FileSystemEntry {
  const fsEntryAbsPath = path.join(rootEntry.absPath, fsEntryRelPath);
  const isFolder = fs.statSync(fsEntryAbsPath).isDirectory();
  const name = getNameFromFilePath(fsEntryRelPath);
  const fsEntry: FileSystemEntry = isFolder
    ? {
        type: 'folder',
        name,
        relPath: fsEntryRelPath,
        childrenEntryNames: [],
        isExcluded: false,
      }
    : {
        type: 'file',
        name,
        relPath: fsEntryRelPath,
        isExcluded: false,
        isDirty: false,
        text: fs.readFileSync(fsEntryAbsPath, 'utf8'),
      };
  return fsEntry;
}

/**
 * Checks if the specified filename should be excluded per the global exclusion config
 */

function isFileSystemEntryExcluded(appConfig: AppConfig, fsEntry: FileSystemEntry) {
  return appConfig.scanExcludes.some(e => micromatch.isMatch(fsEntry.relPath, e));
}

/**
 * Recursively reads the provided folder in line with the provided appConfig and populates the
 * provided maps with found files and resources.
 *
 * Returns the list of filenames (not paths) found in the specified folder
 */

export function readFilesFromFolder(
  folderAbsPath: string,
  rootEntry: RootEntry,
  appConfig: AppConfig,
  resourceMap: ResourceMapType,
  fsEntryMap: FileSystemEntryMap,
  helmChartMap: HelmChartMapType,
  helmValuesMap: HelmValuesMapType
) {
  const files = fs.readdirSync(folderAbsPath);
  const resultEntryNames: string[] = [];

  // is this a helm chart folder?
  if (files.indexOf('Chart.yaml') !== -1 && files.indexOf('values.yaml') !== -1) {
    const helmChart: HelmChart = {
      id: uuidv4(),
      filePath: path.join(folderAbsPath, 'Chart.yaml').substr(rootEntry.absPath.length),
      name: folderAbsPath.substr(folderAbsPath.lastIndexOf(path.sep) + 1),
      valueFileIds: [],
    };

    files.forEach(file => {
      const fsEntryAbsPath = path.join(folderAbsPath, file);
      const fsEntryRelPath = fsEntryAbsPath.substr(rootEntry.absPath.length);
      const fsEntry = createFileSystemEntry(rootEntry, fsEntryRelPath);

      if (isFileSystemEntryExcluded(appConfig, fsEntry)) {
        fsEntry.isExcluded = true;
      } else if (fsEntry.type === 'folder') {
        fsEntry.childrenEntryNames = readFilesFromFolder(
          fsEntryAbsPath,
          rootEntry,
          appConfig,
          resourceMap,
          fsEntryMap,
          helmChartMap,
          helmValuesMap
        );
      } else if (micromatch.isMatch(file, '*values*.yaml')) {
        const helmValues: HelmValuesFile = {
          id: uuidv4(),
          filePath: fsEntryRelPath,
          name: file,
          isSelected: false,
          helmChartId: helmChart.id,
        };

        helmValuesMap[helmValues.id] = helmValues;
        helmChart.valueFileIds.push(helmValues.id);
      }

      fsEntryMap[fsEntry.relPath] = fsEntry;
      resultEntryNames.push(fsEntry.name);
    });

    helmChartMap[helmChart.id] = helmChart;
  } else {
    files.forEach(file => {
      const fsEntryAbsPath = path.join(folderAbsPath, file);
      const fsEntryRelPath = fsEntryAbsPath.substr(rootEntry.absPath.length);
      const fsEntry = createFileSystemEntry(rootEntry, fsEntryRelPath);

      if (isFileSystemEntryExcluded(appConfig, fsEntry)) {
        fsEntry.isExcluded = true;
      } else if (fsEntry.type === 'folder') {
        fsEntry.childrenEntryNames = readFilesFromFolder(
          fsEntryAbsPath,
          rootEntry,
          appConfig,
          resourceMap,
          fsEntryMap,
          helmChartMap,
          helmValuesMap
        );
      } else if (appConfig.fileIncludes.some(e => micromatch.isMatch(fsEntry.name, e))) {
        try {
          extractK8sResourcesFromFileEntry(fsEntry).forEach(resource => {
            resourceMap[resource.id] = resource;
          });
        } catch (e) {
          log.warn(`Failed to parse yaml in file ${fsEntry.name}; ${e}`);
        }
      }

      fsEntryMap[fsEntry.relPath] = fsEntry;
      resultEntryNames.push(fsEntry.name);
    });
  }

  return resultEntryNames;
}

/**
 * Returns all resources associated with the specified path
 */

export function getResourcesForPath(fileRelPath: string, resourceMap: ResourceMapType) {
  return Object.values(resourceMap).filter(r => r.fileRelPath === fileRelPath);
}

/**
 * Returns the absolute path to the folder containing the file containing the
 * specified resource
 */

export function getAbsoluteResourceFolder(resource: K8sResource, rootEntry: RootEntry) {
  return path.join(rootEntry.absPath, resource.fileRelPath.substr(0, resource.fileRelPath.lastIndexOf(path.sep)));
}

/**
 * Returns the absolute path to the file that containing specified resource
 */

export function getAbsoluteResourcePath(resource: K8sResource, rootEntry: RootEntry) {
  return path.join(rootEntry.absPath, resource.fileRelPath);
}

/**
 * Extracts all resources from the file at the specified path
 */

export function extractK8sResourcesFromFileEntry(fileEntry: FileEntry) {
  if (!fileEntry.text) {
    return [];
  }
  return extractK8sResources(fileEntry.text, fileEntry.relPath);
}

/**
 * Returns a list of all FileSystemEntries "leading up" to (and including) the specified path
 */

export function getAllFileSystemEntriesForPath(
  filePath: string,
  fsEntryMap: FileSystemEntryMap,
  rootEntry: RootEntry
): FileSystemEntry[] {
  let parent: RootOrFileSystemEntry = rootEntry;
  const fileSystemEntries: FileSystemEntry[] = [];
  filePath.split(path.sep).forEach(pathSegment => {
    if (parent.type === 'file') {
      return;
    }
    if (parent.childrenEntryNames.includes(pathSegment)) {
      const child = fsEntryMap[getChildRelPath(pathSegment, parent)];
      if (child) {
        fileSystemEntries.push(child);
        parent = child;
      }
    }
  });

  return fileSystemEntries;
}

/**
 * Gets the relative path of a child to a specified parent
 */

export function getChildRelPath(childEntryName: string, parentFsEntry: RootOrFileSystemEntry) {
  return parentFsEntry.type === 'root' ? path.sep + childEntryName : path.join(parentFsEntry.relPath, childEntryName);
}

/**
 * Returns the fileEntry for the specified absolute path
 */

export function getEntryForAbsolutePath(
  absolutePath: string,
  fsEntryMap: FileSystemEntryMap,
  rootEntry: RootEntry
): RootOrFileSystemEntry | undefined {
  if (rootEntry.absPath === absolutePath) {
    return rootEntry;
  }
  return absolutePath.startsWith(rootEntry.absPath)
    ? fsEntryMap[absolutePath.substr(rootEntry.absPath.length)]
    : undefined;
}

/**
 * Updates the fileEntry from the specified path - and its associated resources
 */

export function reloadFile(absolutePath: string, fileEntry: FileEntry, state: AppState) {
  if (!fileEntry.timestamp || fs.statSync(absolutePath).mtime.getTime() > fileEntry.timestamp) {
    log.info(`updating from file ${absolutePath}`);

    const resourcesInFile = getResourcesForPath(fileEntry.relPath, state.resourceMap);
    let wasSelected = false;

    resourcesInFile.forEach(resource => {
      if (state.selectedResourceId === resource.id) {
        updateSelectionAndHighlights(state, resource); // TODO: is this needed here?
        wasSelected = true;
      }
      delete state.resourceMap[resource.id];
    });

    if (state.selectedPath === fileEntry.relPath) {
      state.selectedPath = undefined;
      clearResourceSelections(state.resourceMap);
    }

    const resourcesFromFile = extractK8sResourcesFromFileEntry(fileEntry);
    resourcesFromFile.forEach(resource => {
      state.resourceMap[resource.id] = resource;
    });

    reprocessResources([], state.resourceMap, state.fsEntryMap);

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
  const rootEntry = state.rootEntry;
  if (!rootEntry) {
    return undefined;
  }
  const fsEntry = createFileSystemEntry(rootEntry, absolutePath.substr(rootEntry.absPath.length));
  if (fsEntry.type === 'file') {
    extractK8sResourcesFromFileEntry(fsEntry).forEach(resource => {
      state.resourceMap[resource.id] = resource;
    });
  }

  return fsEntry;
}

/**
 * Adds the folder at the specified path with the specified parent
 */

function addFolder(folderAbsPath: string, state: AppState, appConfig: AppConfig) {
  log.info(`adding folder ${folderAbsPath}`);
  const rootEntry = state.rootEntry;
  if (!rootEntry) {
    return undefined;
  }
  if (folderAbsPath.startsWith(rootEntry.absPath)) {
    const fsEntry = createFileSystemEntry(rootEntry, folderAbsPath.substr(rootEntry.absPath.length));
    if (fsEntry.type === 'folder') {
      fsEntry.childrenEntryNames = readFilesFromFolder(
        folderAbsPath,
        rootEntry,
        appConfig,
        state.resourceMap,
        state.fsEntryMap,
        state.helmChartMap,
        state.helmValuesMap
      );
    }
    return fsEntry;
  }

  log.error(`added folder ${folderAbsPath} is not under root ${rootEntry.absPath} - ignoring...`);
}

/**
 * Adds the file/folder at specified path - and its contained resources
 */

export function addPath(absolutePath: string, state: AppState, appConfig: AppConfig) {
  if (!state.rootEntry) {
    return undefined;
  }
  const parentAbsolutePath = absolutePath.substr(0, absolutePath.lastIndexOf(path.sep));
  const parentEntry = getEntryForAbsolutePath(parentAbsolutePath, state.fsEntryMap, state.rootEntry);

  if (parentEntry) {
    const newFsEntry = fs.statSync(absolutePath).isDirectory()
      ? addFolder(absolutePath, state, appConfig)
      : addFile(absolutePath, state);

    if (newFsEntry) {
      state.fsEntryMap[newFsEntry.relPath] = newFsEntry;

      if (parentEntry.type !== 'file') {
        parentEntry.childrenEntryNames.push(newFsEntry.name);
      }

      reprocessResources([], state.resourceMap, state.fsEntryMap);
    }

    return newFsEntry;
  }
  log.warn(`Failed to find folder entry for ${absolutePath}, ignoring..`);

  return undefined;
}

/**
 * Removes the specified fileEntry and its resources from the provided state
 */

function removeFile(fileEntry: FileEntry, state: AppState) {
  log.info(`removing file ${fileEntry.relPath}`);
  getResourcesForPath(fileEntry.relPath, state.resourceMap).forEach(resource => {
    if (state.selectedResourceId === resource.id) {
      updateSelectionAndHighlights(state, resource);
    }
    delete state.resourceMap[resource.id];
  });
}

/**
 * Removes the specified fileEntry and its resources from the provided state
 */

function removeFolder(folderEntry: RootEntry | FolderEntry, state: AppState) {
  const folderPath = folderEntry.type === 'root' ? folderEntry.absPath : folderEntry.relPath;
  log.info(`removing folder ${folderPath}`);
  folderEntry.childrenEntryNames.forEach(childEntryName => {
    const childEntry = state.fsEntryMap[getChildRelPath(childEntryName, folderEntry)];
    if (!childEntry) {
      return;
    }
    if (childEntry.type === 'folder') {
      removeFolder(childEntry, state);
    } else if (childEntry.type === 'file') {
      removeFile(childEntry, state);
    }
  });
}

/**
 * Removes the FileEntry at the specified path - and its associated resources
 */

export function removePath(absolutePath: string, state: AppState, fsEntry: RootOrFileSystemEntry) {
  delete state.fsEntryMap[fsEntry.type === 'root' ? fsEntry.absPath : fsEntry.relPath];

  if (fsEntry.type === 'folder' || fsEntry.type === 'root') {
    removeFolder(fsEntry, state);
  } else if (fsEntry.type === 'file') {
    removeFile(fsEntry, state);
  }

  if (state.selectedPath && !state.fsEntryMap[state.selectedPath]) {
    state.selectedPath = undefined;
    clearResourceSelections(state.resourceMap);
  }

  if (!state.rootEntry) {
    return;
  }
  // remove from parent
  const parentAbsolutePath = absolutePath.substr(0, absolutePath.lastIndexOf(path.sep));
  const parentEntry = getEntryForAbsolutePath(parentAbsolutePath, state.fsEntryMap, state.rootEntry);
  if (parentEntry && parentEntry.type !== 'file') {
    const ix = parentEntry.childrenEntryNames.indexOf(fsEntry.name);
    if (ix >= 0) {
      parentEntry.childrenEntryNames.splice(ix, 1);
    }
  }

  reprocessResources([], state.resourceMap, state.fsEntryMap);
}
