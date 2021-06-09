import fs from 'fs';
import {AppConfig, FileEntry, K8sResource, ResourceRef, ResourceRefType} from "../models/state";
import {
  SELECT_K8SRESOURCE,
  SELECT_KUSTOMIZATION, SelectK8sResourceAction, SelectK8sResourceDispatchType,
  SelectKustomizationAction,
  SelectKustomizationDispatchType,
  SET_FILTER_OBJECTS,
  SET_ROOT_FOLDER,
  SetFilterObjectsDispatchType,
  SetRootFolderAction,
  SetRootFolderDispatchType
} from "./actionTypes";
import path from "path";
import {parseAllDocuments} from "yaml";
import micromatch from "micromatch";

export function setFilterObjectsOnSelection(value: boolean) {
  return (dispatch: SetFilterObjectsDispatchType) => {
    dispatch({
      type: SET_FILTER_OBJECTS,
      filterObjectsOnSelection: value
    })
  }
}

function selectKustomizationRefs(resourceMap: Map<string, K8sResource>, itemId: string) {
  let linkedResourceIds: string[] = []
  const kustomization = resourceMap.get(itemId)
  if (kustomization && kustomization.refs) {
    kustomization.refs.filter(r => r.refType === ResourceRefType.KustomizationResource).forEach(r => {
      const target = resourceMap.get(r.targetResourceId);
      if (target) {
        linkedResourceIds.push(r.targetResourceId)

        if (target.kind === "Kustomization") {
          linkedResourceIds = linkedResourceIds.concat(selectKustomizationRefs(resourceMap, r.targetResourceId))
        }
      }
    })
  }

  return linkedResourceIds
}

function selectLinkedResources(resourceMap: Map<string, K8sResource>, resource: K8sResource) {
  const linkedResourceIds: string[] = []
  resource.refs?.forEach(ref => {
    linkedResourceIds.push(ref.targetResourceId)
  })

  return linkedResourceIds;
}

export function selectK8sResource(itemId: string, resourceMap: Map<string, K8sResource>) {
  return (dispatch: SelectK8sResourceDispatchType) => {
    const action: SelectK8sResourceAction = {
      type: SELECT_K8SRESOURCE,
    }

    const resource = resourceMap.get(itemId)
    if (resource) {
      clearResourceSelections(resourceMap, itemId)

      if (resource.selected) {
        resource.selected = false
      } else {
        resource.selected = true
        action.resourceId = resource.id
        action.linkedResourceIds = selectLinkedResources(resourceMap, resource);
      }
    }

    dispatch(action)
  }
}

function clearResourceSelections(resourceMap: Map<string, K8sResource>, itemId: string) {
  Array.from(resourceMap.values()).forEach(e => {
    e.highlight = false
    if (e.id != itemId) {
      e.selected = false
    }
  })
}

export function selectKustomization(itemId: string, resourceMap: Map<string, K8sResource>) {
  return (dispatch: SelectKustomizationDispatchType) => {
    const action: SelectKustomizationAction = {
      type: SELECT_KUSTOMIZATION,
    }

    const resource = resourceMap.get(itemId)
    if (resource) {
      clearResourceSelections(resourceMap, itemId);

      if (resource.selected) {
        resource.selected = false
      } else {
        resource.selected = true
        action.kustomizationResourceId = resource.id
        action.linkedResourceIds = selectKustomizationRefs(resourceMap, itemId);
      }

      dispatch(action)
    }
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
    processServices(rootEntry, resourceMap)

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
          fileEntry: fileEntry,
          name: createResourceName(rootFolder, fileEntry, content),
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
  getK8sResources(resourceMap, "Kustomization").forEach(kustomization => {
    if (kustomization.content.resources || kustomization.content.bases) {
      var resources = kustomization.content.resources || []
      if (kustomization.content.bases) {
        resources = resources.concat(kustomization.content.bases)
      }

      resources.forEach((r: string) => {
        const fileEntry = fileMap.get(path.join(kustomization.fileEntry.folder, r))
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

function getK8sResources(resourceMap: Map<string, K8sResource>, type: string) {
  return Array.from(resourceMap.values()).filter(item => item.kind === type);
}

/**
 * link services to target deployments via their label selector if specified
 */
function processServices(rootEntry: FileEntry, resourceMap: Map<string, K8sResource>) {
  const deployments = getK8sResources(resourceMap, "Deployment").filter(d => d.content.spec?.template?.metadata?.labels)

  getK8sResources(resourceMap, "Service").forEach(service => {
    if (service.content.spec && service.content.spec.selector) {
      Object.keys(service.content.spec.selector).forEach((e: any) => {
        deployments.filter(d => d.content.spec.template.metadata.labels[e] === service.content.spec.selector[e]).forEach(d => {
          d.refs = d.refs || []
          d.refs.push({
            refType: ResourceRefType.ServicePodSelector,
            targetResourceId: service.id
          })

          service.refs = service.refs || []
          service.refs.push({
            refType: ResourceRefType.ServicePodSelector,
            targetResourceId: d.id
          })
        })
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
