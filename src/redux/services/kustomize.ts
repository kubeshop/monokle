import micromatch from 'micromatch';
import path from 'path';

import {KUSTOMIZATION_API_GROUP, KUSTOMIZATION_KIND} from '@constants/constants';

import {getResourcesForPath} from '@redux/services/fileEntry';

import {FileMapType, ResourceMapType} from '@shared/models/appState';
import {FileEntry} from '@shared/models/fileEntry';
import {K8sResource, ResourceRefType} from '@shared/models/k8sResource';

import {NodeWrapper, getScalarNodes, linkResources} from './resource';

/**
 * Creates kustomization refs between a kustomization and its resources
 */

function linkParentKustomization(
  fileEntry: FileEntry,
  kustomization: K8sResource,
  resourceMap: ResourceMapType,
  refNode: NodeWrapper
) {
  let result: K8sResource[] = [];

  getResourcesForPath(fileEntry.filePath, resourceMap).forEach(r => {
    // since the target is a file there is no target refNode
    linkResources(kustomization, r, refNode);
    result.push(r);
  });

  return result;
}

/**
 * Checks if the specified resource is a kustomization resource
 */

export function isKustomizationResource(r: K8sResource | undefined) {
  return r && r.kind === KUSTOMIZATION_KIND && (!r.apiVersion || r.apiVersion.startsWith(KUSTOMIZATION_API_GROUP));
}

/**
 * Checks if the specified resource is a kustomization patch
 */

export function isKustomizationPatch(r: K8sResource | undefined) {
  return r && r.name.startsWith('Patch: ');
}

export function isKustomizationFilePath(filePath: string) {
  return micromatch.isMatch(path.basename(filePath).toLowerCase(), '*kustomization*.yaml');
}

/**
 * Checks if the specified fileEntry is a kustomization file
 */

export function isKustomizationFile(fileEntry: FileEntry, resourceMap: ResourceMapType) {
  if (fileEntry?.filePath && isKustomizationFilePath(fileEntry.filePath)) {
    const resources = getResourcesForPath(fileEntry.filePath, resourceMap);
    return resources.length === 1 && isKustomizationResource(resources[0]);
  }

  return false;
}

/**
 * Processes a resource ref in a kustomization and creates corresponding resourcerefs
 */

function processKustomizationResourceRef(
  kustomization: K8sResource,
  refNode: NodeWrapper,
  resourceMap: ResourceMapType,
  fileMap: FileMapType
) {
  let resourcePath = path.join(path.parse(kustomization.filePath).dir, refNode.nodeValue());
  const fileEntry = fileMap[resourcePath];
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
      let result = linkParentKustomization(fileEntry, kustomization, resourceMap, refNode);

      // no resources found in file? - create a fileref instead
      if (result.length === 0) {
        createKustomizationFileRef(kustomization, refNode, resourcePath, fileMap);
      }
    }
  } else {
    createKustomizationFileRef(kustomization, refNode, resourcePath, fileMap);
  }
}

/**
 * Extract patches at the specified nodePath and create resource or file refs
 */

function extractPatches(
  kustomization: K8sResource,
  fileMap: FileMapType,
  resourceMap: ResourceMapType,
  patchPath: string
) {
  let patches = getScalarNodes(kustomization, patchPath);
  patches
    .filter(refNode => refNode.node.type === 'PLAIN')
    .filter(refNode => !isExternalResourceRef(refNode))
    .forEach((refNode: NodeWrapper) => {
      let kpath = path.join(path.parse(kustomization.filePath).dir, refNode.nodeValue());
      const fileEntry = fileMap[kpath];
      if (fileEntry) {
        let linkedResources = linkParentKustomization(fileEntry, kustomization, resourceMap, refNode);
        if (linkedResources.length > 0) {
          linkedResources.forEach(resource => {
            if (!resource.name.startsWith('Patch:')) {
              resource.name = `Patch: ${resource.name}`;
            }
          });
        } else {
          createKustomizationFileRef(kustomization, refNode, kpath, fileMap);
        }
      } else {
        // this will create an unsatisfied file ref
        createKustomizationFileRef(kustomization, refNode, kpath, fileMap);
      }
    });
}

// as specified by https://github.com/hashicorp/go-getter#url-format
function isExternalResourceRef(refNode: NodeWrapper) {
  const externalPrefixes: string[] = [
    'http://',
    'https://',
    'github.com/',
    'gitlab.com/',
    'bitbucket.org/',
    'git::',
    'hg::',
    's3::',
    'gcs::',
    'file:',
  ];

  let value = refNode.nodeValue().toLowerCase();
  return externalPrefixes.findIndex(v => value.startsWith(v)) >= 0;
}

/**
 * Processes all kustomizations in resourceMap and establishes corresponding resourcerefs
 */

export function processKustomizations(resourceMap: ResourceMapType, fileMap: FileMapType) {
  Object.values(resourceMap)
    .filter(r => isKustomizationResource(r))
    .filter(k => k.content.resources || k.content.bases || k.content.patchesStrategicMerge || k.content.patchesJson6902)
    .forEach(kustomization => {
      let resources = getScalarNodes(kustomization, 'resources') || [];
      if (kustomization.content.bases) {
        resources = resources.concat(getScalarNodes(kustomization, 'bases'));
      }

      resources
        .filter(refNode => !isExternalResourceRef(refNode))
        .forEach((refNode: NodeWrapper) => {
          processKustomizationResourceRef(kustomization, refNode, resourceMap, fileMap);
        });

      if (kustomization.content.patchesStrategicMerge) {
        extractPatches(kustomization, fileMap, resourceMap, 'patchesStrategicMerge');
      }
      if (kustomization.content.patchesJson6902) {
        extractPatches(kustomization, fileMap, resourceMap, 'patchesJson6902:path');
      }
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
        if (r.target?.type === 'resource' && r.target.resourceId) {
          const target = resourceMap[r.target.resourceId];
          if (target) {
            linkedResourceIds.push(r.target.resourceId);

            if (isKustomizationResource(target) && r.type === ResourceRefType.Outgoing) {
              linkedResourceIds = linkedResourceIds.concat(getKustomizationRefs(resourceMap, r.target.resourceId));
            }
          }
        }
      });
  }

  return linkedResourceIds;
}

/**
 * Adds a file ref to the specified file to the specified resource
 */

function createKustomizationFileRef(
  resource: K8sResource,
  refNode: NodeWrapper,
  filePath: string,
  fileMap: FileMapType
) {
  if (filePath.endsWith(path.sep)) {
    filePath = filePath.substring(0, filePath.length - 1);
  }

  let refType = fileMap[filePath] ? ResourceRefType.Outgoing : ResourceRefType.Unsatisfied;
  resource.refs = resource.refs || [];
  const refName = (refNode ? refNode.nodeValue() : filePath) || '<missing>';

  resource.refs.push({
    type: refType,
    name: refName,
    position: refNode?.getNodePosition(),
    target: {
      type: 'file',
      filePath,
    },
  });
}
