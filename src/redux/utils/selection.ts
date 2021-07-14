import {AppState, FileMapType, ResourceMapType} from '@models/appstate';
import {K8sResource} from '@models/k8sresource';
import {FileEntry} from '@models/fileentry';
import {getAllFileEntriesForPath, getChildFilePath, getResourcesForPath} from '@redux/utils/fileEntry';
import {getLinkedResources, isFileResource} from '@redux/utils/resource';
import {getKustomizationRefs, isKustomizationResource} from '@redux/utils/kustomize';
import path from 'path';

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
 * Clear all file selections
 */

export function clearFileSelections(fileMap: FileMapType) {
  Object.values(fileMap).forEach(e => {
    e.selected = false;
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
 * Marks the file entry for the specified resource as selected and ensures that all
 * parent entries are expanded
 */

export function selectResourceFileEntry(resource: K8sResource, fileMap: FileMapType) {
  let result = '';
  getAllFileEntriesForPath(resource.filePath, fileMap).forEach(e => {
    result = path.join(result, e.name);
    if (e.children) {
      e.expanded = true;
    } else {
      e.selected = true;
    }
  });

  return result;
}

/**
 * Ensures the correct resources are selected/highlighted when selecting the
 * specified resource
 */

export function updateSelectionAndHighlights(state: AppState, resource: K8sResource) {
  clearResourceSelections(state.resourceMap, resource.id);
  if (!state.previewResource) {
    clearFileSelections(state.fileMap);
  }
  state.selectedResource = undefined;

  if (resource.selected) {
    resource.selected = false;
  } else {
    resource.selected = true;
    state.selectedResource = resource.id;
    if (isFileResource(resource)) {
      state.selectedPath = selectResourceFileEntry(resource, state.fileMap);
    }

    if (isKustomizationResource(resource)) {
      getKustomizationRefs(state.resourceMap, resource.id, true).forEach(e => {
        state.resourceMap[e].highlight = true;
      });
    } else {
      getLinkedResources(resource).forEach(e => {
        state.resourceMap[e].highlight = true;
      });
    }
  }
}
