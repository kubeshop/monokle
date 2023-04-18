import {KUSTOMIZATION_API_GROUP, KUSTOMIZATION_KIND} from '@constants/constants';

import {FileEntry} from '@shared/models/fileEntry';
import {ResourceMeta, ResourceMetaMap} from '@shared/models/k8sResource';
import {isKustomizationFilePath} from '@shared/utils/kustomize';

import {getLocalResourceMetasForPath} from './fileEntry';

/**
 * Checks if the specified resource is a kustomization resource
 */

export function isKustomizationResource(r: ResourceMeta | undefined) {
  return r && r.kind === KUSTOMIZATION_KIND && (!r.apiVersion || r.apiVersion.startsWith(KUSTOMIZATION_API_GROUP));
}

/**
 * Checks if the specified resource is a kustomization patch
 */

export function isKustomizationPatch(r: ResourceMeta | undefined) {
  return r && r.name.startsWith('Patch: ');
}

/**
 * Checks if the specified fileEntry is a kustomization file
 */

export function isKustomizationFile(fileEntry: FileEntry, resourceMetaMap: ResourceMetaMap<'local'>) {
  if (fileEntry?.filePath && isKustomizationFilePath(fileEntry.filePath)) {
    const resources = getLocalResourceMetasForPath(fileEntry.filePath, resourceMetaMap);
    return resources.length === 1 && isKustomizationResource(resources[0]);
  }

  return false;
}
