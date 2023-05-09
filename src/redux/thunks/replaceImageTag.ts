import {createAsyncThunk} from '@reduxjs/toolkit';

import log from 'loglevel';

import {UpdateMultipleResourcesPayload, selectImage} from '@redux/reducers/main';
import {activeResourceStorageSelector} from '@redux/selectors/resourceMapSelectors';
import {joinK8sResourceMap} from '@redux/services/resource';

import {AppDispatch} from '@shared/models/appDispatch';
import {ImageType} from '@shared/models/image';
import {ResourceMap} from '@shared/models/k8sResource';
import {ThunkApi} from '@shared/models/thunk';

import {updateMultipleResources} from './updateMultipleResources';

export const _replaceImageTag = (
  image: ImageType,
  newImageTag: string,
  resourceMap: ResourceMap,
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

    resourcesToUpdate.push({resourceIdentifier: resource, content: newResourceText});
  });

  dispatch(updateMultipleResources(resourcesToUpdate));
  // dispatch(selectImage({image: {...image, id: `${image.name}:${newImageTag}`, tag: newImageTag}}));
  // TODO: do we have to update the imageList / imageMap or will that happen by updating the resources?
  dispatch(selectImage({imageId: `${image.name}:${newImageTag}`}));
};

export const replaceImageTag = createAsyncThunk<void, {image: ImageType; tag: string}, ThunkApi>(
  'main/replaceImageTag',
  ({image, tag}, {getState, dispatch}) => {
    const activeResourceStorage = activeResourceStorageSelector(getState());
    if (activeResourceStorage !== 'local') {
      log.warn('Cannot replace image tag for non-local resources');
      return;
    }

    const resourceMap = joinK8sResourceMap(
      getState().main.resourceMetaMapByStorage.local,
      getState().main.resourceContentMapByStorage.local,
      meta => {
        return image.resourcesIds.includes(meta.id);
      }
    );

    _replaceImageTag(image, tag, resourceMap, dispatch);
  }
);
