import fs from 'fs';
import path from 'path';
import micromatch from 'micromatch';
import {LineCounter, parseAllDocuments} from 'yaml';
import log from 'loglevel';
import {FileMapType, ResourceMapType} from '@models/appstate';
import {AppConfig} from '@models/appconfig';
import {FileEntry} from '@models/fileentry';
import {K8sResource} from '@models/k8sresource';
import {ROOT_FILE_ENTRY} from '@src/constants';
import {createResourceName, uuidv4} from './resource';

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
    const fileEntry: FileEntry = {
      name: file,
      filePath: path.join(folder, file).substr(rootFolder.length),
      highlight: false,
      selected: false,
      expanded: false,
      excluded: false,
    };

    const filePath = path.join(folder, file);
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

function extractK8sResourcesFromFile(filePath: string, fileMap: FileMapType) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const rootEntry = fileMap[ROOT_FILE_ENTRY];
  return extractK8sResources(fileContent, rootEntry ? filePath.substr(rootEntry.filePath.length) : filePath);
}

/**
 * Returns a list of all FileEntries "leading up" to (and including) the specified path
 */

export function getAllFileEntriesForPath(filePath: string, fileMap: FileMapType) {
  let parent = fileMap[ROOT_FILE_ENTRY];
  const result: FileEntry[] = [parent];
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
