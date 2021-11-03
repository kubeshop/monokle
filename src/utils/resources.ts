import _ from 'lodash';
import flatten from 'flat';
import {ResourceFilterType} from '@models/appstate';
import {K8sResource} from '@models/k8sresource';
import {isPassingKeyValueFilter} from '@utils/filter';

export const makeResourceNameKindNamespaceIdentifier = (resource: K8sResource) =>
  `${resource.name}#${resource.kind}#${resource.namespace ? resource.namespace : 'default'}`;

export function isResourcePassingFilter(resource: K8sResource, filters: ResourceFilterType) {
  if (
    filters.name &&
    filters.name.trim() !== '' &&
    resource.name.toLowerCase().indexOf(filters.name.toLowerCase()) === -1
  ) {
    return false;
  }
  if (filters.kind && resource.kind !== filters.kind) {
    return false;
  }
  if (filters.namespace) {
    if (!resource.namespace && filters.namespace !== 'default') {
      return false;
    }
    return resource.namespace === filters.namespace;
  }
  if (filters.labels && Object.keys(filters.labels).length > 0) {
    const resourceLabels = resource.content?.metadata?.labels;
    if (!resourceLabels) {
      return false;
    }
    const isPassingLabelFilter = isPassingKeyValueFilter(resourceLabels, filters.labels);
    if (!isPassingLabelFilter) {
      return false;
    }
  }
  if (filters.annotations && Object.keys(filters.annotations).length > 0) {
    const resourceAnnotations = resource.content?.metadata?.annotations;
    if (!resourceAnnotations) {
      return false;
    }
    const isPassingAnnotationsFilter = isPassingKeyValueFilter(resourceAnnotations, filters.annotations);
    if (!isPassingAnnotationsFilter) {
      return false;
    }
  }
  return true;
}

export function isLocalResourceDifferentThanClusterResource(localResource: K8sResource, clusterResource: K8sResource) {
  const flatLocalResourceContent = flatten<any, string[]>(localResource.content, {delimiter: '#'});
  const localResourceContentPaths = Object.keys(flatLocalResourceContent);
  let isDiff: boolean = false;
  for (let i = 0; i < localResourceContentPaths.length; i += 1) {
    const currentPathString = localResourceContentPaths[i];
    const currentPath = currentPathString.split('#');
    const localValue = _.get(localResource.content, currentPath);
    const clusterValue = _.get(clusterResource.content, currentPath);
    if (!_.isEqual(localValue, clusterValue)) {
      isDiff = true;
      break;
    }
  }
  return isDiff;
}
