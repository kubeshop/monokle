import {K8sResource, ResourceRefType} from "../../models/state";

export function clearResourceSelections(resourceMap: Map<string, K8sResource>, itemId: string) {
  Array.from(resourceMap.values()).forEach(e => {
    e.highlight = false
    if (e.id != itemId) {
      e.selected = false
    }
  })
}

export function selectKustomizationRefs(resourceMap: Map<string, K8sResource>, itemId: string) {
  let linkedResourceIds: string[] = []
  const kustomization = resourceMap.get(itemId)
  if (kustomization && kustomization.refs) {
    kustomization.refs.filter(r => r.refType === ResourceRefType.KustomizationResource).forEach(r => {
      const target = resourceMap.get(r.targetResourceId);
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

export function selectLinkedResources(resourceMap: Map<string, K8sResource>, resource: K8sResource) {
  const linkedResourceIds: string[] = []
  resource.refs?.forEach(ref => {
    linkedResourceIds.push(ref.targetResourceId)
  })

  return linkedResourceIds;
}
