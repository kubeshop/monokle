import {FileEntry, K8sResource, ResourceRef, ResourceRefType} from "../../models/state";
import {getK8sResources, isKustomization} from "./resource";
import path from "path";

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

export function processKustomizations(rootEntry: FileEntry, resourceMap: Map<string, K8sResource>, fileMap: Map<string, FileEntry>) {
  getK8sResources(resourceMap, "Kustomization").forEach(kustomization => {
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
