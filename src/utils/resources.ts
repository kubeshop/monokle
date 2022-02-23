import flatten from 'flat';
import _ from 'lodash';

import {CLUSTER_RESOURCE_IGNORED_PATHS} from '@constants/clusterResource';

import {ResourceFilterType} from '@models/appstate';
import {K8sResource} from '@models/k8sresource';

import {isPassingKeyValueFilter} from '@utils/filter';
import {removeNestedEmptyObjects} from '@utils/objects';

export function makeResourceNameKindNamespaceIdentifier(partialResource: {
  name: string;
  kind: string;
  namespace?: string;
}) {
  return `${partialResource.name}#${partialResource.kind}#${
    partialResource.namespace ? partialResource.namespace : 'default'
  }`;
}

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
    const resourceNamespace = resource.namespace || 'default';
    if (resourceNamespace !== filters.namespace) {
      return false;
    }
  }
  if (filters.fileOrFolderContainedIn && !resource.filePath.startsWith(filters.fileOrFolderContainedIn)) {
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

export function getDefaultNamespaceForApply(resources: K8sResource[], defaultNamespace = 'default'): {
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
