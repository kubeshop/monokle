import fs from 'fs';
import {
  AppConfig,
  FileEntry,
  K8sResource,
  ResourceRef,
  ResourceRefType, SelectKustomizationAction,
  SelectKustomizationDispatchType,
  SetRootFolderAction,
  SetRootFolderDispatchType
} from "../models/state";
import {SELECT_KUSTOMIZATION, SET_ROOT_FOLDER} from "./actionTypes";
import path from "path";
import {parseAllDocuments} from "yaml";
import micromatch from "micromatch";

function selectKustomizationRefs(resourceMap: Map<string, K8sResource>, itemId: string, action: SelectKustomizationAction) {
  const kustomization = resourceMap.get(itemId)
  if (kustomization && kustomization.refs) {
    kustomization.refs.filter(r => r.refType === ResourceRefType.KustomizationResource).forEach(r => {
      const target = resourceMap.get(r.targetResourceId);
      if (target) {
        action.resourceIds.push(r.targetResourceId)

        if (target.kind === "Kustomization") {
          selectKustomizationRefs(resourceMap, r.targetResourceId, action)
        }
      }
    })
  }
}

export function selectKustomization(itemId: string, resourceMap: Map<string, K8sResource>) {
  return (dispatch: SelectKustomizationDispatchType) => {
    const action: SelectKustomizationAction = {
      type: SELECT_KUSTOMIZATION,
      resourceIds: []
    }

    // clear existing highlights
    Array.from(resourceMap.values()).forEach(e => e.highlight = false)
    selectKustomizationRefs(resourceMap, itemId, action);
    dispatch(action)
  }
}

export function setRootFolder(rootFolder: string, appConfig: AppConfig) {
  return (dispatch: SetRootFolderDispatchType) => {
    const folderPath = path.parse(rootFolder)
    const resourceMap: Map<string, K8sResource> = new Map()
    const fileMap: Map<string, FileEntry> = new Map()

    const rootEntry: FileEntry = {
      name: folderPath.name,
      folder: folderPath.dir,
      highlight: false,
      selected: false,
      expanded: false,
      excluded: false,
      children: []
    };

    rootEntry.children = getAllFiles(rootFolder, appConfig, resourceMap, fileMap, rootEntry, rootFolder);
    processKustomizations(rootEntry, resourceMap, fileMap)

    const action: SetRootFolderAction = {
      type: SET_ROOT_FOLDER,
      rootFolder: rootFolder,
      appConfig: appConfig,
      resources: [],
      rootEntry: rootEntry,
      resourceMap: resourceMap,
      fileMap: fileMap
    }

    dispatch(action)
  }
}

const getAllFiles = function (folder: string, appConfig: AppConfig, resourceMap: Map<string, K8sResource>,
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
      excluded: false,
      parent: parent
    }

    const filePath = path.join(folder, file);
    if (fs.statSync(filePath).isDirectory()) {
      const folderPath = filePath.substr(rootFolder.length + 1)
      if (appConfig.scanExcludes.some(e => micromatch.isMatch(folderPath, e))) {
        fileEntry.excluded = true
      } else {
        fileEntry.children = getAllFiles(filePath, appConfig, resourceMap, fileMap, fileEntry, rootFolder)
      }
    } else if (appConfig.fileIncludes.some(e => file.toLowerCase().endsWith(e))) {
      extractYamlContent(rootFolder, fileEntry, resourceMap);
    }

    fileMap.set(filePath, fileEntry)
    result.push(fileEntry)
  })

  return result
}

function createResourceName(rootFolder: string, fileEntry: FileEntry, content: any) {
  if (content.kind === "Kustomization") {
    return fileEntry.folder.substr(rootFolder.length + 1)
  }

  var name = content.metadata?.name ? content.metadata.name + " " : ""
  return name + content.kind + " [" + content.apiVersion + "]"
}

function extractYamlContent(rootFolder: string, fileEntry: FileEntry, resourceMap: Map<string, K8sResource>) {
  const fileContent = fs.readFileSync(path.join(fileEntry.folder, fileEntry.name), 'utf8')
  const documents = parseAllDocuments(fileContent)

  if (documents) {
    documents.forEach(d => {
      const content = d.toJS();
      if (content && content.apiVersion && content.kind) {
        var resource: K8sResource = {
          folder: fileEntry.folder,
          file: fileEntry.name,
          name: createResourceName(rootFolder, fileEntry, content),
          id: uuidv4(),
          kind: content.kind,
          version: content.apiVersion,
          content: content,
          highlight: false
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

function linkParentKustomization(fileEntry: FileEntry, kustomization: K8sResource, resourceMap: Map<string, K8sResource>) {
  if (fileEntry.resourceIds) {
    const parentRef: ResourceRef = {
      targetResourceId: kustomization.id,
      refType: ResourceRefType.KustomizationParent
    }

    fileEntry.resourceIds.forEach(e => {
      const target = resourceMap.get(e)
      if (target) {
        target.refs = target.refs || []
        target.refs.push(parentRef)
      }

      kustomization.refs = kustomization.refs || []
      kustomization.refs.push(
        {
          targetResourceId: e,
          refType: ResourceRefType.KustomizationResource
        }
      )
    })
  }
}

function isKustomization(childFileEntry: FileEntry, resourceMap: Map<string, K8sResource>) {
  if (childFileEntry.name.toLowerCase() === "kustomization.yaml" && childFileEntry.resourceIds) {
    const r = resourceMap.get(childFileEntry.resourceIds[0])
    if (r && r.kind === "Kustomization") {
      return true
    }
  }

  return false
}

function processKustomizations(rootEntry: FileEntry, resourceMap: Map<string, K8sResource>, fileMap: Map<string, FileEntry>) {
  Array.from(resourceMap.values()).filter(item => item.kind === "Kustomization").forEach(kustomization => {
    if (kustomization.content.resources || kustomization.content.bases) {
      var resources = kustomization.content.resources || []
      if (kustomization.content.bases) {
        resources = resources.concat(kustomization.content.bases)
      }

      resources.forEach((r: string) => {
        const fileEntry = fileMap.get(path.join(kustomization.folder, r))
        if (fileEntry) {
          if (fileEntry.children) {
            // resource is folder -> find contained kustomizations and link...
            fileEntry.children.filter(
              childFileEntry => isKustomization(childFileEntry, resourceMap)
            ).forEach(childFileEntry => {
              linkParentKustomization(childFileEntry, kustomization, resourceMap)
            })
          } else {
            // resource is file -> check for contained resources
            linkParentKustomization(fileEntry, kustomization, resourceMap);
          }
        }
      })
    }
  })
}

// taken from https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid
export function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
