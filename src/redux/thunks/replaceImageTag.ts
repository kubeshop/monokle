import {AppDispatch} from '@models/appdispatch';
import {ResourceMapType} from '@models/appstate';
import {DockerImage} from '@models/image';

import {updateResource} from './updateResource';

export const replaceImageTag = (
  image: DockerImage,
  newImageTag: string,
  resourceMap: ResourceMapType,
  dispatch: AppDispatch
) => {
  const {resourcesIds} = image;

  resourcesIds.forEach(resourceId => {
    const resource = resourceMap[resourceId];

    const resourceRefs = resource.refs?.filter(
      ref => ref.type === 'outgoing' && ref.target?.type === 'image' && ref.name === image.name
    );

    let newResourceText = '';
    resource.text.split('\n').forEach((line, index) => {
      let found = false;

      resourceRefs?.forEach(ref => {
        if (ref.target?.type === 'image' && ref.position?.line === index + 1) {
          const oldImage = `${ref.name}:${ref.target?.tag}`;
          const newImage = `${ref.name}:${newImageTag}`;

          newResourceText += `${line.replace(oldImage, newImage)}\n`;
          found = true;
        }
      });

      if (!found) {
        newResourceText += `${line}\n`;
      }
    });

    dispatch(updateResource({resourceId, content: newResourceText}));
  });
};
