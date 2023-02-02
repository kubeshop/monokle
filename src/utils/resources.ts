import flatten from 'flat';
import _ from 'lodash';

import {CLUSTER_RESOURCE_IGNORED_PATHS} from '@constants/clusterResource';

import {removeNestedEmptyObjects} from '@utils/objects';

import {ResourceFilterType} from '@shared/models/appState';
import {K8sResource, ResourceRefType} from '@shared/models/k8sResource';
import {isPassingKeyValueFilter} from '@shared/utils/filter';

export function isResourcePassingFilter(resource: K8sResource, filters: ResourceFilterType, isInPreviewMode?: boolean) {
  if (filters.name && filters.name.length && !resource.name.includes(filters.name.toLowerCase())) {
    return false;
  }

  if (filters.kinds?.length && !filters.kinds?.includes(resource.kind)) {
    return false;
  }

  if (filters.namespaces?.length && !filters.namespaces?.includes(resource?.namespace || 'default')) {
    return false;
  }

  if (
    !isInPreviewMode &&
    filters.fileOrFolderContainedIn &&
    !resource.filePath.startsWith(filters.fileOrFolderContainedIn)
  ) {
    return false;
  }

  if (filters.labels && Object.keys(filters.labels).length > 0) {
    const resourceLabels = resource.content?.metadata?.labels;
    const templateLabels = resource.content?.spec?.template?.metadata?.labels;
    if (!resourceLabels && !templateLabels) {
      return false;
    }
    const isPassingLabelFilter =
      (resourceLabels && isPassingKeyValueFilter(resourceLabels, filters.labels)) ||
      (templateLabels && isPassingKeyValueFilter(templateLabels, filters.labels));
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

export function removeIgnoredPathsFromResourceContent(clusterResourceContent: any, localResourceNamespace?: string) {
  const flattenClusterResourceContent = flatten<any, any>(clusterResourceContent, {delimiter: '#'});
  const clusterResourceContentPaths = Object.keys(flattenClusterResourceContent);

  // deep copy of the clusterResourceContent
  const newClusterContent = JSON.parse(JSON.stringify(clusterResourceContent));

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

  if (_.get(newClusterContent, 'metadata.namespace') === 'default' && localResourceNamespace === undefined) {
    _.unset(newClusterContent, 'metadata.namespace');
  }

  return removeNestedEmptyObjects(newClusterContent);
}

export function diffLocalToClusterResources(localResource: K8sResource, clusterResource: K8sResource) {
  const cleanClusterResourceContent = removeIgnoredPathsFromResourceContent(
    clusterResource.content,
    _.get(localResource.content, 'metadata.namespace')
  );

  const cleanLocalResourceContent = removeNestedEmptyObjects(localResource.content);

  return {
    areDifferent: !_.isEqual(cleanLocalResourceContent, cleanClusterResourceContent),
    cleanLocalResourceContent,
    cleanClusterResourceContent,
  };
}

export function getDefaultNamespaceForApply(
  resources: K8sResource[],
  defaultNamespace = 'default'
): {
  defaultNamespace: string;
  defaultOption?: string;
} {
  let namespace = defaultNamespace;

  for (let i = 0; i < resources.length; i += 1) {
    const resourceNamespace = resources[i].namespace;

    if (resourceNamespace) {
      if (resources[i].namespace !== namespace) {
        if (namespace !== 'default') {
          return {defaultNamespace: 'default', defaultOption: 'none'};
        }

        namespace = resourceNamespace;
      }
    }
  }

  return {defaultNamespace: namespace};
}

export function countResourceWarnings(resources: K8sResource[]): number {
  return resources.reduce<number>((acc, resource) => {
    return acc + (resource.refs ? resource.refs.filter(ref => ref.type === ResourceRefType.Unsatisfied).length : 0);
  }, 0);
}

export function countResourceErrors(resources: K8sResource[]): number {
  return resources.reduce<number>((acc, resource) => {
    const validationErrorCount = resource.validation ? resource.validation.errors.length : 0;
    const policyErrorCount = resource.issues ? resource.issues.errors.length : 0;
    return acc + validationErrorCount + policyErrorCount;
  }, 0);
}

export function getApiVersionGroup(resource: K8sResource) {
  return resource.apiVersion.includes('/') ? resource.apiVersion.split('/')[0] : 'kubernetes';
}
