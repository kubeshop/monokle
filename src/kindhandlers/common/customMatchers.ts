import {K8sResource} from '@monokle-desktop/shared/models/k8sResource';

/**
 * Matcher that ensures the source and target namespace are the same
 */

export function implicitNamespaceMatcher(sourceResource: K8sResource, targetResource: K8sResource) {
  return targetResource.namespace === sourceResource.namespace;
}

/**
 * Matcher the ensures that the target resource has an optionally specified namespace
 */

export function optionalExplicitNamespaceMatcher(
  sourceResource: K8sResource,
  targetResource: K8sResource,
  value: string
) {
  if (value) {
    return targetResource.namespace === value;
  }

  return targetResource.namespace === sourceResource.namespace;
}

/**
 * Matcher the ensures that the target resource has the specified namespace
 */

export function explicitNamespaceMatcher(sourceResource: K8sResource, targetResource: K8sResource, value: string) {
  return targetResource.namespace === value;
}

/**
 * Matcher the ensures that the target resource has the specified kind
 */

export function targetKindMatcher(sourceResource: K8sResource, targetResource: K8sResource, value: string) {
  return targetResource.kind === value;
}

/**
 * Matcher the ensures that the target resource has the specified apiGroup - uses an optional defaultGroup configuration
 * property if no group is found
 */

export function targetGroupMatcher(
  sourceResource: K8sResource,
  targetResource: K8sResource,
  value: string,
  siblingValues: any,
  properties?: any
) {
  if (!value && properties && properties['defaultGroup']) {
    value = properties['defaultGroup'];
  }
  return targetResource.apiVersion.startsWith(`${value}/`);
}
