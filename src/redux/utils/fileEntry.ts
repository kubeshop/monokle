import { AppConfig, FileEntry, K8sResource } from '../../models/state';
import fs from "fs";
import path from "path";
import micromatch from "micromatch";
import {parseAllDocuments} from "yaml";
import {createResourceName, uuidv4} from "./resource";

export function readFiles(folder: string, appConfig: AppConfig, resourceMap: Map<string, K8sResource>,
                          fileMap: Map<string, FileEntry>, parent: FileEntry, rootFolder: string) {
  const files = fs.readdirSync(folder)
  const result: FileEntry[] = []

  files.forEach(function (file) {
    const fileEntry: FileEntry = {
      name: file,
      folder: folder,
      highlight: false,
      selected: false,
      expanded: false,
      excluded: false
    }

    const filePath = path.join(folder, file);
    if (fs.statSync(filePath).isDirectory()) {
      const folderPath = filePath.substr(rootFolder.length + 1)
      if (appConfig.scanExcludes.some(e => micromatch.isMatch(folderPath, e))) {
        fileEntry.excluded = true
      } else {
        fileEntry.children = readFiles(filePath, appConfig, resourceMap, fileMap, fileEntry, rootFolder)
      }
    } else if (appConfig.fileIncludes.some(e => file.toLowerCase().endsWith(e))) {
      extractYamlContent(rootFolder, fileEntry, resourceMap);
    }

    fileMap.set(filePath, fileEntry)
    result.push(fileEntry)
  })

  return result
}

function extractYamlContent(rootFolder: string, fileEntry: FileEntry, resourceMap: Map<string, K8sResource>) {
  const fileContent = fs.readFileSync(path.join(fileEntry.folder, fileEntry.name), 'utf8')
  const documents = parseAllDocuments(fileContent)

  if (documents) {
    documents.forEach(d => {
      const content = d.toJS();
      if (content && content.apiVersion && content.kind) {
        var resource: K8sResource = {
          name: createResourceName(rootFolder, fileEntry, content),
          folder: fileEntry.folder,
          file: fileEntry.name,
          id: uuidv4(),
          kind: content.kind,
          version: content.apiVersion,
          content: content,
          highlight: false,
          selected: false
        }

        resourceMap.set(resource.id, resource)
        if (!fileEntry.resourceIds) {
          fileEntry.resourceIds = []
        }

        fileEntry.resourceIds.push(resource.id)
      }
    })
  }
}

function getFileEntries(resource: K8sResource, rootEntry:FileEntry) {
  var parent = rootEntry;
  const result: FileEntry[] = [];
  const segments = resource.folder.substr(rootEntry.folder.length+1).split( path.sep );
  segments.push( resource.file )

  segments.forEach(pathSegment => {
    const file = parent.children?.find(child => child.name === pathSegment);
    if( file ){
      result.push(file);
      parent = file;
    }
  })

  return result
}

export function selectResourceFileEntry(resource: K8sResource, rootEntry: FileEntry) {
  getFileEntries( resource, rootEntry ).forEach( e => {
    if( e.children ){
      e.expanded = true
    } else {
      e.selected = true
    }
  })
}

