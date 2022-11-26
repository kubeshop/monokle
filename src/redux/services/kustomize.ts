import micromatch from 'micromatch';
import path from 'path';

import {KUSTOMIZATION_API_GROUP, KUSTOMIZATION_KIND} from '@constants/constants';

import {getResourcesForPath} from '@redux/services/fileEntry';

import {FileEntry} from '@shared/models/fileEntry';
import {K8sResource, ResourceMapType} from '@shared/models/k8sResource';

/**
 * Checks if the specified resource is a kustomization resource
 */

export function isKustomizationResource(r: K8sResource | undefined) {
  return r && r.kind === KUSTOMIZATION_KIND && (!r.apiVersion || r.apiVersion.startsWith(KUSTOMIZATION_API_GROUP));
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
 * Checks if the specified resource is a kustomization patch
 */

export function isKustomizationPatch(r: K8sResource | undefined) {
  return r && r.name.startsWith('Patch: ');
}

// TODO: kustomization patches should be handled here
// while the kustomization refs will be handled by @monokle/validation

// /**
//  * Extract patches at the specified nodePath and create resource or file refs
//  */

// function extractPatches(
//   kustomization: K8sResource,
//   fileMap: FileMapType,
//   resourceMap: ResourceMapType,
//   patchPath: string
// ) {
//   let patches = getScalarNodes(kustomization, patchPath);
//   patches
//     .filter(refNode => refNode.node.type === 'PLAIN')
//     .forEach((refNode: NodeWrapper) => {
//       let kpath = path.join(path.parse(kustomization.filePath).dir, refNode.nodeValue());
//       const fileEntry = fileMap[kpath];
//       if (fileEntry) {
//         let linkedResources = linkParentKustomization(fileEntry, kustomization, resourceMap, refNode);
//         if (linkedResources.length > 0) {
//           linkedResources.forEach(resource => {
//             if (!resource.name.startsWith('Patch:')) {
//               resource.name = `Patch: ${resource.name}`;
//             }
//           });
//         } else {
//           createKustomizationFileRef(kustomization, refNode, kpath, fileMap);
//         }
//       } else {
//         // this will create an unsatisfied file ref
//         createKustomizationFileRef(kustomization, refNode, kpath, fileMap);
//       }
//     });
// }

// /**
//  * Processes all kustomizations in resourceMap and establishes corresponding resourcerefs
//  */

// export function processKustomizations(resourceMap: ResourceMapType, fileMap: FileMapType) {
//   Object.values(resourceMap)
//     .filter(r => isKustomizationResource(r))
//     .filter(k => k.content.resources || k.content.bases || k.content.patchesStrategicMerge || k.content.patchesJson6902)
//     .forEach(kustomization => {
//       let resources = getScalarNodes(kustomization, 'resources') || [];
//       if (kustomization.content.bases) {
//         resources = resources.concat(getScalarNodes(kustomization, 'bases'));
//       }

//       resources
//         .filter(refNode => !isExternalResourceRef(refNode))
//         .forEach((refNode: NodeWrapper) => {
//           processKustomizationResourceRef(kustomization, refNode, resourceMap, fileMap);
//         });

//       if (kustomization.content.patchesStrategicMerge) {
//         extractPatches(kustomization, fileMap, resourceMap, 'patchesStrategicMerge');
//       }
//       if (kustomization.content.patchesJson6902) {
//         extractPatches(kustomization, fileMap, resourceMap, 'patchesJson6902:path');
//       }
//     });
// }
