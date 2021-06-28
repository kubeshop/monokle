import path from 'path';
import log from 'loglevel';
import {FileMapType, ResourceMapType} from '@models/appstate';
import {FileEntry} from '@models/fileentry';
import {K8sResource, ResourceRefType} from '@models/k8sresource';
import {getResourcesInFile} from '@redux/utils/fileEntry';
import {getK8sResources, isKustomizationFile, linkResources} from './resource';

function linkParentKustomization(fileEntry: FileEntry, kustomization: K8sResource, resourceMap: ResourceMapType) {
  getResourcesInFile(fileEntry.filePath, resourceMap).forEach(r => {
    linkResources(kustomization, r, ResourceRefType.KustomizationResource, ResourceRefType.KustomizationParent);
  });
}

function processKustomizationResource(
  fileMap: FileMapType,
  kustomization: K8sResource,
  resource: string,
  resourceMap: ResourceMapType
) {
  let kpath = path.join(path.parse(kustomization.filePath).dir, resource);
  const fileEntry = fileMap[kpath];
  if (fileEntry) {
    if (fileEntry.children) {
      // resource is folder -> find contained kustomizations and link...
      fileEntry.children
        .map(child => fileMap[path.join(fileEntry.filePath, child)])
        .filter(childFileEntry => childFileEntry !== undefined)
        .filter(childFileEntry => isKustomizationFile(childFileEntry, resourceMap))
        .forEach(childFileEntry => {
          linkParentKustomization(childFileEntry, kustomization, resourceMap);
        });
    } else {
      // resource is file -> check for contained resources
      linkParentKustomization(fileEntry, kustomization, resourceMap);
    }
  }
}

export function processKustomizations(resourceMap: ResourceMapType, fileMap: FileMapType) {
  getK8sResources(resourceMap, 'Kustomization')
    .filter(k => k.content.resources || k.content.bases || k.content.patchesStrategicMerge)
    .forEach(kustomization => {
      let resources = kustomization.content.resources || [];
      if (kustomization.content.bases) {
        resources = resources.concat(kustomization.content.bases);
      }

      resources.forEach((r: string) => {
        processKustomizationResource(fileMap, kustomization, r, resourceMap);
      });

      kustomization.content.patchesStrategicMerge?.forEach((e: string) => {
        const fileEntry = fileMap[path.join(path.parse(kustomization.filePath).dir, e)];
        if (fileEntry) {
          getResourcesInFile(fileEntry.filePath, resourceMap).forEach(resource => {
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
