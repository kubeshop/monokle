import {FileMapType, ResourceMapType} from '@models/appstate';
import {K8sResource, ResourceRefType} from '@models/k8sresource';
import {FileEntry} from '@models/fileentry';
import {isUnsatisfiedRef} from '@redux/utils/resource';
import {getResourcesInFile} from '@redux/utils/fileEntry';
import path from 'path';

export function getKustomizationRefs(resourceMap: ResourceMapType, kustomizationId: string, selectParent: boolean) {
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
        if (r.target) {
          const target = resourceMap[r.target];
          if (target) {
            linkedResourceIds.push(r.target);

            if (target.kind === 'Kustomization' && r.refType === ResourceRefType.KustomizationResource) {
              linkedResourceIds = linkedResourceIds.concat(getKustomizationRefs(resourceMap, r.target, false));
            }
          }
        }
      });
  }

  return linkedResourceIds;
}

export function getLinkedResources(resource: K8sResource) {
  const linkedResourceIds: string[] = [];
  resource.refs
    ?.filter(ref => !isUnsatisfiedRef(ref.refType))
    .forEach(ref => {
      linkedResourceIds.push(ref.target);
    });

  return linkedResourceIds;
}

export function clearResourceSelections(resourceMap: ResourceMapType, itemId?: string) {
  Object.values(resourceMap).forEach(e => {
    e.highlight = false;
    if (!itemId || e.id !== itemId) {
      e.selected = false;
    }
  });
}

export function clearFileSelections(fileMap: FileMapType) {
  Object.values(fileMap).forEach(e => {
    e.selected = false;
  });
}

export function highlightChildren(fileEntry: FileEntry, resourceMap: ResourceMapType, fileMap: FileMapType) {
  fileEntry.children
    ?.map(e => fileMap[path.join(fileEntry.filePath, e)])
    .forEach(child => {
      getResourcesInFile(child.filePath, resourceMap).forEach(e => {
        e.highlight = true;
      });
      if (child.children) {
        highlightChildren(child, resourceMap, fileMap);
      }
    });
}
