import log from 'loglevel';

import {AppState, FileMapType, ResourceMapType} from '@models/appstate';
import {FileEntry} from '@models/fileentry';
import {K8sResource} from '@models/k8sresource';

import {getChildFilePath, getResourcesForPath} from '@redux/services/fileEntry';
import {getKustomizationRefs, isKustomizationResource} from '@redux/services/kustomize';
import {getLinkedResources} from '@redux/services/resource';

/**
 * Clears all resource highlights and selections except selection for the specified item
 */

export function clearResourceSelections(resourceMap: ResourceMapType, excludeItemId?: string) {
  Object.values(resourceMap).forEach(e => {
    e.isHighlighted = false;
    if (!excludeItemId || e.id !== excludeItemId) {
      e.isSelected = false;
    }
  });
}

/**
 * Highlight all resources in all children of the specified file
 */

export function highlightChildrenResources(fileEntry: FileEntry, resourceMap: ResourceMapType, fileMap: FileMapType) {
  fileEntry.children
    ?.map(e => fileMap[getChildFilePath(e, fileEntry, fileMap)])
    .filter(child => child)
    .forEach(child => {
      getResourcesForPath(child.filePath, resourceMap).forEach(e => {
        e.isHighlighted = true;
      });
      if (child.children) {
        highlightChildrenResources(child, resourceMap, fileMap);
      }
    });
}

export function highlightResource(resourceMap: ResourceMapType, resourceId: string) {
  const currentResource = resourceMap[resourceId];
  if (currentResource) {
    currentResource.isHighlighted = true;
  } else {
    log.warn(`[updateSelectionAndHighlights]: Couldn't find resource with id ${resourceId}`);
  }
}

/**
 * Ensures the correct resources are selected/highlighted when selecting the
 * specified resource
 */
export function updateSelectionAndHighlights(state: AppState, resource: K8sResource) {
  clearResourceSelections(state.resourceMap, resource.id);

  state.selectedPath = undefined;
  state.selectedResourceId = undefined;
  state.selectedPreviewConfigurationId = undefined;
  state.selectedImage = undefined;

  if (resource) {
    resource.isSelected = true;
    state.selectedResourceId = resource.id;

    if (isKustomizationResource(resource)) {
      getKustomizationRefs(state.resourceMap, resource.id, true).forEach(resourceId => {
        highlightResource(state.resourceMap, resourceId);
      });
    } else {
      getLinkedResources(resource).forEach(resourceId => {
        highlightResource(state.resourceMap, resourceId);
      });
    }

    Object.values(state.helmValuesMap).forEach(valuesFile => {
      valuesFile.isSelected = false;
    });
  }
}
