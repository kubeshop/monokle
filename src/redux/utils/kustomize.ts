import { FileEntry, K8sResource, ResourceMapType, ResourceRefType } from '../../models/state';
import { getK8sResources, isKustomizationFile, linkResources } from './resource';
import path from 'path';

function linkParentKustomization(fileEntry: FileEntry, kustomization: K8sResource, resourceMap: ResourceMapType) {
  fileEntry.resourceIds?.forEach(e => {
    const target = resourceMap[e];
    if (target) {
      linkResources(kustomization, target, ResourceRefType.KustomizationResource, ResourceRefType.KustomizationParent);
    }
  });
}

export function processKustomizations(resourceMap: ResourceMapType, fileMap: Map<string, FileEntry>) {
  getK8sResources(resourceMap, 'Kustomization')
    .filter(k => k.content.resources || k.content.bases)
    .forEach(kustomization => {
      var resources = kustomization.content.resources || [];
      if (kustomization.content.bases) {
        resources = resources.concat(kustomization.content.bases);
      }

      resources.forEach((r: string) => {
        // @ts-ignore
        const fileEntry = fileMap.get(path.join(path.parse(kustomization.path).dir, r));
        if (fileEntry) {
          if (fileEntry.children) {
            // resource is folder -> find contained kustomizations and link...
            fileEntry.children.filter(
              childFileEntry => isKustomizationFile(childFileEntry, resourceMap),
            ).forEach(childFileEntry => {
              linkParentKustomization(childFileEntry, kustomization, resourceMap);
            });
          } else {
            // resource is file -> check for contained resources
            linkParentKustomization(fileEntry, kustomization, resourceMap);
          }
        }
      });
    });
}
