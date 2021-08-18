import path from 'path';
import log from 'loglevel';
import {ResourceMapType} from '@models/appstate';
import {K8sResource, ResourceRefType} from '@models/k8sresource';
import {getResourcesForPath} from '@redux/services/fileSystemEntry';
import {FileSystemEntryMap, FileEntry, isFileEntry} from '@models/filesystementry';
import {getK8sResources, getScalarNodes, linkResources, NodeWrapper} from './resource';

/**
 * Creates kustomization refs between a kustomization and its resources
 */

function linkParentKustomization(
  fileEntry: FileEntry,
  kustomization: K8sResource,
  resourceMap: ResourceMapType,
  refNode: NodeWrapper
) {
  getResourcesForPath(fileEntry.relPath, resourceMap).forEach(r => {
    // since the target is a file there is no target refNode
    linkResources(kustomization, r, refNode);
  });
}

/**
 * Checks if the specified resource is a kustomization resource
 */

export function isKustomizationResource(r: K8sResource | undefined) {
  return r && r.kind === 'Kustomization';
}

/**
 * Checks if the specified fileEntry is a kustomization file
 */

export function isKustomizationFile(fileEntry: FileEntry, resourceMap: ResourceMapType) {
  if (fileEntry.name.toLowerCase() === 'kustomization.yaml') {
    const resources = getResourcesForPath(fileEntry.relPath, resourceMap);
    return Boolean(resources.length === 1 && isKustomizationResource(resources[0]));
  }
  return false;
}

/**
 * Processes a resource ref in a kustomization and creates corresponding resourcerefs
 */

function processKustomizationResource(
  kustomization: K8sResource,
  refNode: NodeWrapper,
  resourceMap: ResourceMapType,
  fsEntryMap: FileSystemEntryMap
) {
  let kpath = path.join(path.parse(kustomization.fileRelPath).dir, refNode.nodeValue());
  const fsEntry = fsEntryMap[kpath];
  if (fsEntry) {
    if (fsEntry.type === 'folder') {
      // resource is folder -> find contained kustomizations and link...
      fsEntry.childrenEntryNames
        .map(childEntryName => fsEntryMap[path.join(fsEntry.relPath, childEntryName)])
        .filter(
          (childFileEntry): childFileEntry is FileEntry => childFileEntry !== undefined && isFileEntry(childFileEntry)
        )
        .filter(childFileEntry => isKustomizationFile(childFileEntry, resourceMap))
        .forEach(childFileEntry => {
          linkParentKustomization(childFileEntry, kustomization, resourceMap, refNode);
        });
    } else {
      // resource is file -> check for contained resources
      linkParentKustomization(fsEntry, kustomization, resourceMap, refNode);
    }
  }
}

/**
 * Processes all kustomizations in resourceMap and establishes corresponding resourcerefs
 */

export function processKustomizations(resourceMap: ResourceMapType, fsEntryMap: FileSystemEntryMap) {
  getK8sResources(resourceMap, 'Kustomization')
    .filter(k => k.content.resources || k.content.bases || k.content.patchesStrategicMerge)
    .forEach(kustomization => {
      let resources = getScalarNodes(kustomization, 'resources') || [];
      if (kustomization.content.bases) {
        resources = resources.concat(getScalarNodes(kustomization, 'bases'));
      }

      resources.forEach((refNode: NodeWrapper) => {
        processKustomizationResource(kustomization, refNode, resourceMap, fsEntryMap);
      });

      kustomization.content.patchesStrategicMerge?.forEach((e: string) => {
        const fsEntry = fsEntryMap[path.join(path.parse(kustomization.fileRelPath).dir, e)];
        if (fsEntry) {
          getResourcesForPath(fsEntry.relPath, resourceMap).forEach(resource => {
            if (!resource.name.startsWith('Patch:')) {
              resource.name = `Patch: ${resource.name}`;
            }
          });
        } else {
          log.warn(`Failed to find patchesStrategicMerge ${e} in kustomization ${kustomization.fileRelPath}`);
        }
      });
    });
}

/**
 * Gets all resources directly linked to by a kustomization, including transient resources
 */

export function getKustomizationRefs(
  resourceMap: ResourceMapType,
  kustomizationId: string,
  selectParent: boolean = false
) {
  let linkedResourceIds: string[] = [];
  const kustomization = resourceMap[kustomizationId];
  if (kustomization && kustomization.refs) {
    kustomization.refs
      .filter(r => r.type === ResourceRefType.Outgoing || (selectParent && r.type === ResourceRefType.Incoming))
      .forEach(r => {
        if (r.targetResourceId) {
          const target = resourceMap[r.targetResourceId];
          if (target) {
            linkedResourceIds.push(r.targetResourceId);

            if (target.kind === 'Kustomization' && r.type === ResourceRefType.Outgoing) {
              linkedResourceIds = linkedResourceIds.concat(getKustomizationRefs(resourceMap, r.targetResourceId));
            }
          }
        }
      });
  }

  return linkedResourceIds;
}
