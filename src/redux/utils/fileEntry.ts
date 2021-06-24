import fs from 'fs';
import path from 'path';
import micromatch from 'micromatch';
import {LineCounter, parseAllDocuments} from 'yaml';
import log from 'loglevel';
import {ResourceMapType} from '@models/appstate';
import {AppConfig} from '@models/appconfig';
import {FileEntry} from '@models/fileentry';
import {K8sResource} from '@models/k8sresource';
import {createResourceName, uuidv4} from './resource';

export function readFiles(
  folder: string,
  appConfig: AppConfig,
  resourceMap: ResourceMapType,
  fileMap: Map<string, FileEntry>,
  parent: FileEntry,
  rootFolder: string
) {
  const files = fs.readdirSync(folder);
  const result: FileEntry[] = [];

  files.forEach(file => {
    const fileEntry: FileEntry = {
      name: file,
      folder,
      highlight: false,
      selected: false,
      expanded: false,
      excluded: false,
    };

    const filePath = path.join(folder, file);
    if (fs.statSync(filePath).isDirectory()) {
      const folderPath = filePath.substr(rootFolder.length + 1);
      if (appConfig.scanExcludes.some(e => micromatch.isMatch(folderPath, e))) {
        fileEntry.excluded = true;
      } else {
        fileEntry.children = readFiles(filePath, appConfig, resourceMap, fileMap, fileEntry, rootFolder);
      }
    } else if (appConfig.fileIncludes.some(e => file.toLowerCase().endsWith(e))) {
      try {
        const resources = extractK8sResourcesFromFile(rootFolder, fileEntry);
        if (Object.keys(resources).length > 0) {
          fileEntry.resourceIds = fileEntry.resourceIds || [];
          Object.keys(resources).forEach(id => {
            fileEntry.resourceIds?.push(id);
            resourceMap[id] = resources[id];
          });
        }
      } catch (e) {
        log.warn(`Failed to parse yaml in file ${fileEntry.name}; ${e}`);
        if (fileEntry.resourceIds) {
          fileEntry.resourceIds.forEach(entry => delete resourceMap[entry]);
          fileEntry.resourceIds = undefined;
        }
      }
    }

    fileMap.set(filePath, fileEntry);
    result.push(fileEntry);
  });

  return result;
}

export function extractK8sResources(fileContent: string, filePath: string) {
  const lineCounter: LineCounter = new LineCounter();
  const documents = parseAllDocuments(fileContent, {lineCounter});
  const result: ResourceMapType = {};

  if (documents) {
    let docIndex = 0;
    documents.forEach(d => {
      if (d.errors.length > 0) {
        log.warn(`Ignoring document ${docIndex} in ${path.parse(filePath).name} due to ${d.errors.length} error(s)`);
        d.errors.forEach(e => log.warn(e.message));
      } else {
        const content = d.toJS();
        if (content && content.apiVersion && content.kind) {
          let resource: K8sResource = {
            name: createResourceName(filePath, content),
            path: filePath,
            id: uuidv4(),
            kind: content.kind,
            version: content.apiVersion,
            content,
            highlight: false,
            selected: false,
            linePos: lineCounter.linePos(d.range[0]).line,
            docIndex,
          };
          docIndex += 1;

          if (content.metadata && content.metadata.namespace) {
            resource.namespace = content.metadata.namespace;
          }

          result[resource.id] = resource;
        }
      }
    });
  }
  return result;
}

function extractK8sResourcesFromFile(rootFolder: string, fileEntry: FileEntry) {
  const filePath = path.join(fileEntry.folder, fileEntry.name);
  const fileContent = fs.readFileSync(filePath, 'utf8');
  return extractK8sResources(fileContent, filePath);
}

export function getFileEntryForPath(filePath: string, rootEntry: FileEntry) {
  let current = rootEntry;
  filePath.split(path.sep).forEach(segment => {
    const child = current.children?.find(e => e.name === segment);
    if (child) {
      current = child;
    } else {
      return undefined;
    }
  });

  return current;
}

export function getFileEntryForResource(resource: K8sResource, rootEntry: FileEntry) {
  const entries = getFileEntries(resource, rootEntry);
  return entries.length > 0 ? entries[entries.length - 1] : undefined;
}

function getFileEntries(resource: K8sResource, rootEntry: FileEntry) {
  let parent = rootEntry;
  const result: FileEntry[] = [];
  if (resource.path) {
    const segments = resource.path.substr(rootEntry.folder.length + 1).split(path.sep);
    segments.forEach(pathSegment => {
      const file = parent.children?.find(child => child.name === pathSegment);
      if (file) {
        result.push(file);
        parent = file;
      }
    });
  }

  return result;
}

export function selectResourceFileEntry(resource: K8sResource, rootEntry: FileEntry) {
  let result = '';
  getFileEntries(resource, rootEntry).forEach(e => {
    result = path.join(result, e.name);
    if (e.children) {
      e.expanded = true;
    } else {
      e.selected = true;
    }
  });
  return result;
}

export function getStaticResourcePath(resourcePath: string) {
  return process.env.NODE_ENV === 'development'
    ? path.join('resources', resourcePath)
    : // @ts-ignore
      path.join(process.resourcesPath, 'resources', resourcePath);
}

export function loadResource(resourcePath: string) {
  return fs.readFileSync(getStaticResourcePath(resourcePath), 'utf8');
}
