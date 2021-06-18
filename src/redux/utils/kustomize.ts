import { FileEntry, K8sResource, ResourceRefType } from '../../models/state';
import { getK8sResources, isKustomizationFile, linkResources } from './resource';
import path from 'path';

function linkParentKustomization(fileEntry: FileEntry, kustomization: K8sResource, resourceMap: Map<string, K8sResource>) {
  fileEntry.resourceIds?.forEach(e => {
    const target = resourceMap.get(e);
    if (target) {
      linkResources(kustomization, target, ResourceRefType.KustomizationResource, ResourceRefType.KustomizationParent);
    }
  });
}

export function processKustomizations(resourceMap: Map<string, K8sResource>, fileMap: Map<string, FileEntry>) {
  getK8sResources(resourceMap, 'Kustomization').forEach(kustomization => {
    if (kustomization.content.resources || kustomization.content.bases) {
      var resources = kustomization.content.resources || [];
      if (kustomization.content.bases) {
        resources = resources.concat(kustomization.content.bases);
      }

      resources.forEach((r: string) => {
        const fileEntry = fileMap.get(path.join(kustomization.folder, r));
        if (fileEntry) {
          if (fileEntry.children) {
            // resource is folder -> find contained kustomizations and link...
            fileEntry.children.filter(
              childFileEntry => isKustomizationFile(childFileEntry, resourceMap),
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
