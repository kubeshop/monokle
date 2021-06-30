import fs from 'fs';
import path from 'path';
import micromatch from 'micromatch';
import {LineCounter, parseAllDocuments} from 'yaml';
import log from 'loglevel';
import {AppState, FileMapType, ResourceMapType} from '@models/appstate';
import {AppConfig} from '@models/appconfig';
import {FileEntry} from '@models/fileentry';
import {K8sResource} from '@models/k8sresource';
import {ROOT_FILE_ENTRY} from '@src/constants';
import {clearResourceSelections, updateSelectionAndHighlights} from '@redux/utils/selection';
import {createResourceName, reprocessResources, uuidv4} from './resource';

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
 * Reads the provided folder in line with the provided appConfig and populates the provides maps with found
 * files and resources.
 *
 * Returns the list of filenames (not paths) found in the specified folder
 */

export function readFiles(folder: string, appConfig: AppConfig, resourceMap: ResourceMapType, fileMap: FileMapType) {
  const files = fs.readdirSync(folder);
  const result: string[] = [];
  const rootFolder = fileMap[ROOT_FILE_ENTRY].filePath;

  files.forEach(file => {
    const filePath = path.join(folder, file);
    const fileEntryPath = filePath.substr(rootFolder.length);
    const fileEntry = createFileEntry(fileEntryPath);

    if (appConfig.scanExcludes.some(e => micromatch.isMatch(fileEntry.filePath, e))) {
      fileEntry.excluded = true;
    } else if (fs.statSync(filePath).isDirectory()) {
      fileEntry.children = readFiles(filePath, appConfig, resourceMap, fileMap);
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

  return result;
}

/**
 * Returns all resources associated with the specified path
 */

export function getResourcesInFile(filePath: string, resourceMap: ResourceMapType) {
  return Object.values(resourceMap).filter(r => r.filePath === filePath);
}

/**
 * Extracts all resources from the specified text content (must be yaml)
 */

export function extractK8sResources(fileContent: string, relativePath: string) {
  const lineCounter: LineCounter = new LineCounter();
  const documents = parseAllDocuments(fileContent, {lineCounter});
  const result: K8sResource[] = [];

  if (documents) {
    let docIndex = 0;
    documents.forEach(d => {
      if (d.errors.length > 0) {
        log.warn(
          `Ignoring document ${docIndex} in ${path.parse(relativePath).name} due to ${d.errors.length} error(s)`
        );
        d.errors.forEach(e => log.warn(e.message));
      } else {
        const content = d.toJS();
        if (content && content.apiVersion && content.kind) {
          let resource: K8sResource = {
            name: createResourceName(relativePath, content),
            filePath: relativePath,
            id: uuidv4(),
            kind: content.kind,
            version: content.apiVersion,
            content,
            highlight: false,
            selected: false,
            text: fileContent.slice(d.range[0], d.range[1]),
          };

          if (documents.length > 1) {
            resource.range = {start: d.range[0], length: d.range[1] - d.range[0]};
          }

          if (content.metadata && content.metadata.namespace) {
            resource.namespace = content.metadata.namespace;
          }

          result.push(resource);
        }
      }
      docIndex += 1;
    });
  }
  return result;
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
 * Marks the file entry for the specified resource as selected and ensures that all
 * parent entries are expanded
 */

export function selectResourceFileEntry(resource: K8sResource, fileMap: FileMapType) {
  let result = '';
  getAllFileEntriesForPath(resource.filePath, fileMap).forEach(e => {
    result = path.join(result, e.name);
    if (e.children) {
      e.expanded = true;
    } else {
      e.selected = true;
    }
  });

  return result;
}

/**
 * Gets the absolute path to a statically bundled resource in the /resources folder
 */

export function getStaticResourcePath(resourcePath: string) {
  return process.env.NODE_ENV === 'development'
    ? path.join('resources', resourcePath)
    : // @ts-ignore
      path.join(process.resourcesPath, 'resources', resourcePath);
}

/**
 * Loads the static resource at the specified relative path to /resources
 */

export function loadResource(resourcePath: string) {
  return fs.readFileSync(getStaticResourcePath(resourcePath), 'utf8');
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

    const resourcesInFile = getResourcesInFile(fileEntry.filePath, state.resourceMap);
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
    folderEntry.children = readFiles(absolutePath, state.appConfig, state.resourceMap, state.fileMap);
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
  getResourcesInFile(fileEntry.filePath, state.resourceMap).forEach(resource => {
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
