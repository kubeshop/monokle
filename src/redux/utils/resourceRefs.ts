import {K8sResource, ResourceRefType} from '@models/k8sresource';

const incomingRefs = [
  ResourceRefType.KustomizationParent,
  ResourceRefType.ConfigMapRef,
  ResourceRefType.SelectedPodName,
];

const outgoingRefs = [
  ResourceRefType.KustomizationResource,
  ResourceRefType.ConfigMapConsumer,
  ResourceRefType.ServicePodSelector,
];

const unsatisfiedRefs = [ResourceRefType.UnsatisfiedConfigMap, ResourceRefType.UnsatisfiedSelector];

export function isIncomingRef(e: ResourceRefType) {
  return incomingRefs.includes(e);
}

export function isOutgoingRef(e: ResourceRefType) {
  return outgoingRefs.includes(e);
}

export function isUnsatisfiedRef(e: ResourceRefType) {
  return unsatisfiedRefs.includes(e);
}

export function hasIncomingRefs(resource: K8sResource) {
  return resource.refs?.some(e => isIncomingRef(e.refType));
}

export function hasOutgoingRefs(resource: K8sResource) {
  return resource.refs?.some(e => isOutgoingRef(e.refType));
}

export function hasRefs(resource: K8sResource) {
  return resource.refs?.some(e => isOutgoingRef(e.refType));
}

export function hasUnsatisfiedRefs(resource: K8sResource) {
  return resource.refs?.some(e => isUnsatisfiedRef(e.refType));
}
