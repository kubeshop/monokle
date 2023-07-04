import flatten from 'flat';
import _ from 'lodash';

import {CLUSTER_RESOURCE_IGNORED_PATHS} from '@constants/clusterResource';

import {removeNestedEmptyObjects} from '@utils/objects';

import {ResourceRef} from '@monokle/validation';
import {ResourceFilterType} from '@shared/models/appState';
import {
  K8sResource,
  ResourceMeta,
  isClusterResource,
  isLocalResource,
  isLocalResourceMeta,
  isPreviewResource,
  isTransientResource,
} from '@shared/models/k8sResource';
import {ValidationResource} from '@shared/models/validation';
import {isPassingKeyValueFilter} from '@shared/utils/filter';
import {isEqual} from '@shared/utils/isEqual';

export function isResourcePassingFilter(resourceMeta: ResourceMeta, filters: ResourceFilterType) {
  if (filters.name && filters.name.length && !resourceMeta.name.toLowerCase().includes(filters.name.toLowerCase())) {
    return false;
  }

  if (filters.kinds?.length && !filters.kinds?.includes(resourceMeta.kind)) {
    return false;
  }

  if (filters.namespaces?.length) {
    if (filters.namespaces.includes('<none>') && !resourceMeta.namespace) {
      return true;
    }

    if (!filters.namespaces?.includes(resourceMeta?.namespace || 'default')) {
      return false;
    }
  }

  if (
    filters.fileOrFolderContainedIn &&
    isLocalResourceMeta(resourceMeta) &&
    !resourceMeta.origin.filePath.startsWith(filters.fileOrFolderContainedIn)
  ) {
    return false;
  }

  if (filters.labels && Object.keys(filters.labels).length > 0) {
    const resourceLabels = resourceMeta.labels;
    const templateLabels = resourceMeta.templateLabels;
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
    const resourceAnnotations = resourceMeta.annotations;
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

export function removeIgnoredPathsFromResourceObject(clusterResourceObject: any, localResourceNamespace?: string) {
  const flattenClusterResourceObject = flatten<any, any>(clusterResourceObject, {delimiter: '#'});
  const clusterResourceObjectPaths = Object.keys(flattenClusterResourceObject);

  // deep copy of the clusterResourceObject
  const newClusterContent = JSON.parse(JSON.stringify(clusterResourceObject));

  const clusterResourcePathsToRemove: string[] = [];
  CLUSTER_RESOURCE_IGNORED_PATHS.forEach(ignoredPath => {
    if (ignoredPath.startsWith('...')) {
      clusterResourcePathsToRemove.push(
        ...clusterResourceObjectPaths.filter(contentPath => contentPath.endsWith(ignoredPath.substring(3)))
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
  const cleanClusterResourceObject = removeIgnoredPathsFromResourceObject(
    clusterResource.object,
    _.get(localResource.object, 'metadata.namespace')
  );

  const cleanLocalResourceObject = removeNestedEmptyObjects(localResource.object);

  return {
    areDifferent: !isEqual(cleanLocalResourceObject, cleanClusterResourceObject),
    cleanLocalResourceObject,
    cleanClusterResourceObject,
  };
}

export function getDefaultNamespaceForApply(
  resourceMetaList: ResourceMeta[],
  defaultNamespace = 'default'
): {
  defaultNamespace: string;
  defaultOption?: string;
} {
  let namespace = defaultNamespace;

  for (let i = 0; i < resourceMetaList.length; i += 1) {
    const resourceNamespace = resourceMetaList[i].namespace;

    if (resourceNamespace) {
      if (resourceMetaList[i].namespace !== namespace) {
        if (namespace !== 'default') {
          return {defaultNamespace: 'default', defaultOption: 'none'};
        }

        namespace = resourceNamespace;
      }
    }
  }

  return {defaultNamespace: namespace};
}

export function getApiVersionGroup(resource: K8sResource) {
  return resource.apiVersion.includes('/') ? resource.apiVersion.split('/')[0] : 'kubernetes';
}

export function transformResourceForValidation(r: K8sResource): ValidationResource | undefined {
  let filePath = '';
  let fileOffset = 0;

  if (isLocalResource(r)) {
    filePath = r.origin.filePath.replaceAll('\\', '/');
    fileOffset = r.origin.fileOffset;
  } else if (isClusterResource(r)) {
    filePath = r.origin.context;
    fileOffset = 0;
  } else if (isPreviewResource(r)) {
    filePath = r.origin.preview.type;
    fileOffset = 0;
  } else if (isTransientResource(r)) {
    filePath = 'transient';
    fileOffset = 0;
  }

  return {
    ...r,
    // id: stableStringify({id: r.id, storage: r.storage}), // TODO: do we need this?
    filePath,
    fileOffset,
    fileId: filePath,
    content: r.object,
  };
}

export function transformRefsFilePath(ref: ResourceRef) {
  if (!ref.target || ref.target.type !== 'file') {
    return ref;
  }

  return {...ref, target: {...ref.target, filePath: ref.target.filePath.replaceAll('/', '\\')}};
}
