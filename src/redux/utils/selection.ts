import { K8sResource, ResourceMapType, ResourceRefType } from '../../models/state';

export function selectKustomizationRefs(resourceMap: ResourceMapType, itemId: string) {
  let linkedResourceIds: string[] = []
  const kustomization = resourceMap[itemId]
  if (kustomization && kustomization.refs) {
    kustomization.refs.filter(r => r.refType === ResourceRefType.KustomizationResource).forEach(r => {
      const target = resourceMap[r.targetResourceId];
      if (target) {
        linkedResourceIds.push(r.targetResourceId)

        if (target.kind === "Kustomization") {
          linkedResourceIds = linkedResourceIds.concat(selectKustomizationRefs(resourceMap, r.targetResourceId))
        }
      }
    })
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

export function clearResourceSelections(resourceMap: ResourceMapType, itemId: string) {
  Object.values(resourceMap).forEach(e => {
    e.highlight = false
    if (e.id != itemId) {
      e.selected = false
    }
  })
}
