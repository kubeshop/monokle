import {stringify} from 'yaml';
import {ResourceMapType} from '@models/appstate';
import {updateResource} from '@redux/reducers/main';
import {AppDispatch} from '@redux/store';
import {isIncomingRef} from './resourceRefs';

export const renameResource = (
  resourceId: string,
  newResourceName: string,
  shouldUpdateRefs: boolean,
  resourceMap: ResourceMapType,
  dispatch: AppDispatch
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
  dispatch(updateResource({resourceId, content: newResourceText}));
  if (shouldUpdateRefs && resource.refs) {
    resource.refs.forEach(ref => {
      if (!isIncomingRef(ref.type) || !ref.targetResourceId) {
        return;
      }
      const dependentResource = resourceMap[ref.targetResourceId];
      if (!dependentResource || !dependentResource.refs) {
        return;
      }
      let newDependentResourceText = '';
      dependentResource.text.split('\n').forEach((line, lineIndex) => {
        const refAtCurrentLine = dependentResource.refs?.find(depRef => depRef.position?.line === lineIndex);
        if (!refAtCurrentLine) {
          newDependentResourceText += `${line}\n`;
          return;
        }
        newDependentResourceText += `${line.replace(ref.name, newResourceName)}\n`;
      });
      dispatch(updateResource({resourceId: dependentResource.id, content: newDependentResourceText}));
    });
  }
};
