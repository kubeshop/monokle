import {stringify} from 'yaml';

import {AppDispatch} from '@models/appdispatch';
import {ResourceMapType} from '@models/appstate';

import {isIncomingRef} from '@redux/services/resourceRefs';
import {updateResource} from '@redux/thunks/updateResource';

export const renameResource = (
  resourceId: string,
  newResourceName: string,
  shouldUpdateRefs: boolean,
  resourceMap: ResourceMapType,
  dispatch: AppDispatch,
  selectedResourceId?: string
) => {
  const resource = resourceMap[resourceId];
  if (!resource || !resource.content) {
    return;
  }
  const newResourceContent = {
    ...resource.content,
    metadata: {
      ...(resource.content.metadata || {}),
      name: newResourceName,
    },
  };
  const newResourceText = stringify(newResourceContent);
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
          preventSelectionAndHighlightsUpdate: selectedResourceId !== dependentResource.id,
        })
      );
    });
  }
  dispatch(
    updateResource({
      resourceId,
      text: newResourceText,
      preventSelectionAndHighlightsUpdate: selectedResourceId !== resourceId,
    })
  );
};
