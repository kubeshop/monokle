import {K8sResource} from '@models/k8sresource';

/**
 * Matcher that ensures the source and target namespace are the same
 */

export function implicitNamespaceMatcher(sourceResource: K8sResource, targetResource: K8sResource, value: string) {
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
 * Matcher the ensures that the target resource has the specified apiGroup
 */

export function targetGroupMatcher(sourceResource: K8sResource, targetResource: K8sResource, value: string) {
  return targetResource.version.startsWith(`${value}/`);
}
