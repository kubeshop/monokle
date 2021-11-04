import _ from 'lodash';
import flatten from 'flat';
import {ResourceFilterType} from '@models/appstate';
import {K8sResource} from '@models/k8sresource';
import {isPassingKeyValueFilter} from '@utils/filter';
import {removeNestedEmptyObjects} from '@utils/objects';
import {CLUSTER_RESOURCE_IGNORED_PATHS} from '@constants/clusterResource';

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

export function diffLocalToClusterResources(localResource: K8sResource, clusterResource: K8sResource) {
  const flattenClusterResourceContent = flatten<any, any>(clusterResource.content, {delimiter: '#'});
  const clusterResourceContentPaths = Object.keys(flattenClusterResourceContent);

  // deep copy of the clusterResource.content
  const newClusterContent = JSON.parse(JSON.stringify(clusterResource.content));

  const clusterResourcePathsToRemove: string[] = [];
  CLUSTER_RESOURCE_IGNORED_PATHS.forEach(ignoredPath => {
    if (ignoredPath.startsWith('...')) {
      clusterResourcePathsToRemove.push(
        ...clusterResourceContentPaths.filter(contentPath => contentPath.endsWith(ignoredPath.substring(3)))
      );
    } else {
      clusterResourcePathsToRemove.push(ignoredPath);
    }
  });

  clusterResourcePathsToRemove.forEach(pathToRemove => {
    _.unset(newClusterContent, pathToRemove.split('#'));
  });

  if (
    _.get(newClusterContent, 'metadata.namespace') === 'default' &&
    _.get(localResource.content, 'metadata.namespace') === undefined
  ) {
    _.unset(newClusterContent, 'metadata.namespace');
  }

  const cleanLocalResourceContent = removeNestedEmptyObjects(localResource.content);
  const cleanClusterResourceContent = removeNestedEmptyObjects(newClusterContent);

  return {
    areDifferent: !_.isEqual(cleanLocalResourceContent, cleanClusterResourceContent),
    cleanLocalResourceContent,
    cleanClusterResourceContent,
  };
}
