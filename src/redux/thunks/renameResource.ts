import {stringify} from 'yaml';

import {updateResource} from '@redux/thunks/updateResource';

import {isIncomingRef} from '@monokle/validation';
import {AppDispatch} from '@shared/models/appDispatch';
import {ResourceMap} from '@shared/models/k8sResource';

export const renameResource = (
  resourceId: string,
  newResourceName: string,
  shouldUpdateRefs: boolean,
  resourceMap: ResourceMap,
  dispatch: AppDispatch,
  isResourceSelected?: boolean
) => {
  const resource = resourceMap[resourceId];
  if (!resource || !resource.object) {
    return;
  }
  const newResourceObject = {
    ...resource.object,
    metadata: {
      ...(resource.object.metadata || {}),
      name: newResourceName,
    },
  };
  const newResourceText = stringify(newResourceObject);
  if (shouldUpdateRefs && resource.refs) {
    resource.refs.forEach(ref => {
      if (!isIncomingRef(ref.type) || !(ref.target?.type === 'resource' && ref.target.resourceId)) {
        return;
      }
      const dependentResource = resourceMap[ref.target.resourceId];
      if (!dependentResource || !dependentResource.refs) {
        return;
      }
      let newDependentResourceText = '';
      dependentResource.text.split('\n').forEach((line, lineIndex) => {
        const refAtCurrentLine = dependentResource.refs?.find(depRef => depRef.position?.line === lineIndex + 1);
        if (!refAtCurrentLine) {
          newDependentResourceText += `${line}\n`;
          return;
        }
        newDependentResourceText += `${line.replace(ref.name, newResourceName)}\n`;
      });
      dispatch(
        updateResource({
          resourceId: dependentResource.id,
          text: newDependentResourceText,
          preventSelectionAndHighlightsUpdate: !isResourceSelected,
        })
      );
    });
  }
  dispatch(
    updateResource({
      resourceId,
      text: newResourceText,
      preventSelectionAndHighlightsUpdate: !isResourceSelected,
    })
  );
};
