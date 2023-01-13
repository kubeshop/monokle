import {AppState, FileMapType} from '@shared/models/appState';
import {FileEntry} from '@shared/models/fileEntry';
import {K8sResource, ResourceMetaMap} from '@shared/models/k8sResource';
import {LocalOrigin} from '@shared/models/origin';
import {AppSelection} from '@shared/models/selection';

import {getChildFilePath, getLocalResourceMetasForPath} from './fileEntry';

export function clearSelection(state: AppState) {
  state.selection = undefined;
  state.selectionOptions = {};
}
/**
 * Ensures the correct resources are selected/highlighted when selecting the
 * specified resource
 */
export function updateSelectionAndHighlights(state: AppState, resource: K8sResource) {
  // TODO: will have to refactor this after @monokle/validation is integrated
  // clearResourceSelections(state.resourceMap, resource.id);
  // state.selectedPath = undefined;
  // state.selectedResourceId = undefined;
  // state.selectedPreviewConfigurationId = undefined;
  // state.selectedImage = undefined;
  // if (resource) {
  //   resource.isSelected = true;
  //   state.selectedResourceId = resource.id;
  //   if (isKustomizationResource(resource)) {
  //     getKustomizationRefs(state.resourceMap, resource.id, true).forEach(resourceId => {
  //       highlightResource(state.resourceMap, resourceId);
  //     });
  //   } else {
  //     getLinkedResources(resource).forEach(resourceId => {
  //       highlightResource(state.resourceMap, resourceId);
  //     });
  //   }
  //   Object.values(state.helmValuesMap).forEach(valuesFile => {
  //     valuesFile.isSelected = false;
  //   });
  // }
}

/**
 * Highlight all resources in all children of the specified file
 */

export function createChildrenResourcesHighlights(
  fileEntry: FileEntry,
  resourceMetaMap: ResourceMetaMap<LocalOrigin>,
  fileMap: FileMapType
) {
  let highlights: AppSelection[] = [];

  fileEntry.children
    ?.map(e => fileMap[getChildFilePath(e, fileEntry, fileMap)])
    .filter(child => child)
    .forEach(child => {
      getLocalResourceMetasForPath(child.filePath, resourceMetaMap).forEach(e => {
        highlights.push({
          type: 'resource',
          resourceId: e.id,
          resourceStorage: 'local',
        });
      });
      if (child.children) {
        highlights = highlights.concat(createChildrenResourcesHighlights(child, resourceMetaMap, fileMap));
      }
    });

  return highlights;
}
