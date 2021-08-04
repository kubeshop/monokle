import {AppState, FileMapType, ResourceMapType} from '@models/appstate';
import {K8sResource} from '@models/k8sresource';
import {FileEntry} from '@models/fileentry';
import {getChildFilePath, getResourcesForPath} from '@redux/utils/fileEntry';
import {getLinkedResources} from '@redux/utils/resource';
import {getKustomizationRefs, isKustomizationResource} from '@redux/utils/kustomize';

/**
 * Clears all resource highlights and selections except selection for the specified item
 */

export function clearResourceSelections(resourceMap: ResourceMapType, excludeItemId?: string) {
  Object.values(resourceMap).forEach(e => {
    e.highlight = false;
    if (!excludeItemId || e.id !== excludeItemId) {
      e.selected = false;
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
        e.highlight = true;
      });
      if (child.children) {
        highlightChildrenResources(child, resourceMap, fileMap);
      }
    });
}

/**
 * Ensures the correct resources are selected/highlighted when selecting the
 * specified resource
 */
export function updateSelectionAndHighlights(state: AppState, resource: K8sResource) {
  clearResourceSelections(state.resourceMap, resource.id);

  state.selectedPath = undefined;
  state.selectedResource = undefined;

  if (resource) {
    resource.selected = true;
    state.selectedResource = resource.id;

    if (isKustomizationResource(resource)) {
      getKustomizationRefs(state.resourceMap, resource.id, true).forEach(e => {
        state.resourceMap[e].highlight = true;
      });
    } else {
      getLinkedResources(resource).forEach(e => {
        state.resourceMap[e].highlight = true;
      });
    }

    Object.values(state.helmValuesMap).forEach(valuesFile => {
      valuesFile.selected = false;
    });
  }
}
