import path from 'path';
import log from 'loglevel';
import {FileMapType, ResourceMapType} from '@models/appstate';
import {FileEntry} from '@models/fileentry';
import {K8sResource, ResourceRefType} from '@models/k8sresource';
import {getResourcesForPath} from '@redux/utils/fileEntry';
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
  getResourcesForPath(fileEntry.filePath, resourceMap).forEach(r => {
    // since the target is a file there is no target refNode
    linkResources(
      kustomization,
      r,
      ResourceRefType.KustomizationResource,
      ResourceRefType.KustomizationParent,
      refNode
    );
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
    const resources = getResourcesForPath(fileEntry.filePath, resourceMap);
    return resources.length === 1 && isKustomizationResource(resources[0]);
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
  fileMap: FileMapType
) {
  let kpath = path.join(path.parse(kustomization.filePath).dir, refNode.nodeValue());
  const fileEntry = fileMap[kpath];
  if (fileEntry) {
    if (fileEntry.children) {
      // resource is folder -> find contained kustomizations and link...
      fileEntry.children
        .map(child => fileMap[path.join(fileEntry.filePath, child)])
        .filter(childFileEntry => childFileEntry)
        .filter(childFileEntry => isKustomizationFile(childFileEntry, resourceMap))
        .forEach(childFileEntry => {
          linkParentKustomization(childFileEntry, kustomization, resourceMap, refNode);
        });
    } else {
      // resource is file -> check for contained resources
      linkParentKustomization(fileEntry, kustomization, resourceMap, refNode);
    }
  }
}

/**
 * Processes all kustomizations in resourceMap and establishes corresponding resourcerefs
 */

export function processKustomizations(resourceMap: ResourceMapType, fileMap: FileMapType) {
  getK8sResources(resourceMap, 'Kustomization')
    .filter(k => k.content.resources || k.content.bases || k.content.patchesStrategicMerge)
    .forEach(kustomization => {
      let resources = getScalarNodes(kustomization, 'resources') || [];
      if (kustomization.content.bases) {
        resources = resources.concat(getScalarNodes(kustomization, 'bases'));
      }

      resources.forEach((refNode: NodeWrapper) => {
        processKustomizationResource(kustomization, refNode, resourceMap, fileMap);
      });

      kustomization.content.patchesStrategicMerge?.forEach((e: string) => {
        const fileEntry = fileMap[path.join(path.parse(kustomization.filePath).dir, e)];
        if (fileEntry) {
          getResourcesForPath(fileEntry.filePath, resourceMap).forEach(resource => {
            if (!resource.name.startsWith('Patch:')) {
              resource.name = `Patch: ${resource.name}`;
            }
          });
        } else {
          log.warn(`Failed to find patchesStrategicMerge ${e} in kustomization ${kustomization.filePath}`);
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
      .filter(
        r =>
          r.refType === ResourceRefType.KustomizationResource ||
          (selectParent && r.refType === ResourceRefType.KustomizationParent)
      )
      .forEach(r => {
        if (r.targetResource) {
          const target = resourceMap[r.targetResource];
          if (target) {
            linkedResourceIds.push(r.targetResource);

            if (target.kind === 'Kustomization' && r.refType === ResourceRefType.KustomizationResource) {
              linkedResourceIds = linkedResourceIds.concat(getKustomizationRefs(resourceMap, r.targetResource));
            }
          }
        }
      });
  }

  return linkedResourceIds;
}
