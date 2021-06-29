import {FileMapType, ResourceMapType} from '@models/appstate';
import {K8sResource, ResourceRefType} from '@models/k8sresource';
import {FileEntry} from '@models/fileentry';
import {getChildFilePath, getResourcesInFile} from '@redux/utils/fileEntry';
import {isUnsatisfiedRef} from '@redux/utils/resourceRefs';

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
        const target = resourceMap[r.target];
        if (target) {
          linkedResourceIds.push(r.target);

          if (target.kind === 'Kustomization' && r.refType === ResourceRefType.KustomizationResource) {
            linkedResourceIds = linkedResourceIds.concat(getKustomizationRefs(resourceMap, r.target));
          }
        }
      });
  }

  return linkedResourceIds;
}

/**
 * Gets a resources linked to the specified resource
 */

export function getLinkedResources(resource: K8sResource) {
  const linkedResourceIds: string[] = [];
  resource.refs
    ?.filter(ref => !isUnsatisfiedRef(ref.refType))
    .forEach(ref => {
      linkedResourceIds.push(ref.target);
    });

  return linkedResourceIds;
}

/**
 * Clears all resource highlights and selections except selection for the specified item
 */
export function clearResourceSelections(resourceMap: ResourceMapType, excludeItemId?: string) {
  Object.values(resourceMap).forEach(e => {
    e.highlight = false;
    if (!excludeItemId || e.id !== excludeItemId) {
      e.selected = false;
    }
  });
}

/**
 * Clear all file selections
 */

export function clearFileSelections(fileMap: FileMapType) {
  Object.values(fileMap).forEach(e => {
    e.selected = false;
  });
}

/**
 * Highlight all resources in all children of the specified file
 */

export function highlightChildrenResources(fileEntry: FileEntry, resourceMap: ResourceMapType, fileMap: FileMapType) {
  fileEntry.children
    ?.map(e => fileMap[getChildFilePath(e, fileEntry, fileMap)])
    .filter(child => child)
    .forEach(child => {
      getResourcesInFile(child.filePath, resourceMap).forEach(e => {
        e.highlight = true;
      });
      if (child.children) {
        highlightChildrenResources(child, resourceMap, fileMap);
      }
    });
}
