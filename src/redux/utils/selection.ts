import { FileEntry, K8sResource, ResourceMapType, ResourceRefType } from '../../models/state';

export function selectKustomizationRefs(resourceMap: ResourceMapType, itemId: string, selectParent: boolean) {
  let linkedResourceIds: string[] = [];
  const kustomization = resourceMap[itemId];
  if (kustomization && kustomization.refs) {
    kustomization.refs.filter(r => r.refType === ResourceRefType.KustomizationResource || (
      selectParent && r.refType === ResourceRefType.KustomizationParent
    )).forEach(r => {
      const target = resourceMap[r.targetResourceId];
      if (target) {
        linkedResourceIds.push(r.targetResourceId);

        if (target.kind === 'Kustomization' && r.refType == ResourceRefType.KustomizationResource) {
          linkedResourceIds = linkedResourceIds.concat(selectKustomizationRefs(resourceMap, r.targetResourceId, false));
        }
      }
    });
  }

  return linkedResourceIds
}

export function getLinkedResources(resource: K8sResource) {
  const linkedResourceIds: string[] = []
  resource.refs?.forEach(ref => {
    linkedResourceIds.push(ref.targetResourceId)
  })

  return linkedResourceIds;
}

export function clearResourceSelections(resourceMap: ResourceMapType, itemId?: string) {
  Object.values(resourceMap).forEach(e => {
    e.highlight = false;
    if (!itemId || e.id != itemId) {
      e.selected = false;
    }
  });
}

export function highlightChildren(fileEntry: FileEntry, resourceMap: ResourceMapType) {
  fileEntry.children?.forEach(child => {
    if (child.resourceIds) {
      child.resourceIds.forEach(e => resourceMap[e].highlight = true);
    } else if (child.children) {
      highlightChildren(child, resourceMap);
    }
  });
}
