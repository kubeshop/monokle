import {UpdateMultipleResourcesPayload, selectImage} from '@redux/reducers/main';

import {AppDispatch, ImageType, ResourceMapType} from '@monokle-desktop/shared/models';

import {updateMultipleResources} from './updateMultipleResources';

export const replaceImageTag = (
  image: ImageType,
  newImageTag: string,
  resourceMap: ResourceMapType,
  dispatch: AppDispatch
) => {
  const {resourcesIds} = image;

  let resourcesToUpdate: UpdateMultipleResourcesPayload = [];

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

    resourcesToUpdate.push({resourceId, content: newResourceText});
  });

  dispatch(updateMultipleResources(resourcesToUpdate));
  dispatch(selectImage({image: {...image, id: `${image.name}:${newImageTag}`, tag: newImageTag}}));
};
