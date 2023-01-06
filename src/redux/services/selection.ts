import {AppState} from '@shared/models/appState';
import {K8sResource} from '@shared/models/k8sResource';

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
