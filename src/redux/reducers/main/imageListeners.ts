import {isEqual} from 'lodash';

import {AppListenerFn} from '@redux/listeners/base';
import {activeResourceMetaMapSelector, activeResourceStorageSelector} from '@redux/selectors/resourceMapSelectors';

import {ImagesListType} from '@shared/models/appState';
import {ResourceMetaMap} from '@shared/models/k8sResource';

import {setLeftMenuSelection, toggleLeftMenu} from '../ui';
import {selectImage, setImagesList} from './mainSlice';

function parseImages(resourceMetaMap: ResourceMetaMap) {
  let images: ImagesListType = [];

  Object.values(resourceMetaMap).forEach(k8sResource => {
    if (k8sResource.refs?.length) {
      k8sResource.refs.forEach(ref => {
        if (ref.type === 'outgoing' && ref.target?.type === 'image') {
          const refName = ref.name;
          const refTag = ref.target?.tag || 'latest';

          const foundImage = images.find(image => image.id === `${refName}:${refTag}`);

          if (!foundImage) {
            images.push({id: `${refName}:${refTag}`, name: refName, tag: refTag, resourcesIds: [k8sResource.id]});
          } else if (!foundImage.resourcesIds.includes(k8sResource.id)) {
            foundImage.resourcesIds.push(k8sResource.id);
          }
        }
      });
    }
  });

  return images;
}

export const imageListParserListener: AppListenerFn = listen => {
  listen({
    predicate: (action, currentState, previousState) => {
      const currentActiveStorage = activeResourceStorageSelector(currentState);
      const previousActiveStorage = activeResourceStorageSelector(previousState);
      const currentActiveResourceMetaMap = activeResourceMetaMapSelector(currentState);
      const previousActiveResourceMetaMap = activeResourceMetaMapSelector(previousState);
      return (
        currentActiveStorage !== previousActiveStorage ||
        !isEqual(currentActiveResourceMetaMap, previousActiveResourceMetaMap)
      );
    },

    effect: async (_action, {dispatch, getState}) => {
      const activeResourceMetaMap = activeResourceMetaMapSelector(getState());

      const imagesList = getState().main.imagesList;
      const images = parseImages(activeResourceMetaMap);

      if (!isEqual(images, imagesList)) {
        dispatch(setImagesList(images));
      }
    },
  });
};

export const imageSelectedListener: AppListenerFn = listen => {
  listen({
    type: selectImage.type,
    effect: async (_action, {dispatch, getState}) => {
      const leftMenu = getState().ui.leftMenu;

      if (!leftMenu.isActive) {
        dispatch(toggleLeftMenu());
      }

      if (leftMenu.selection !== 'images-pane') {
        dispatch(setLeftMenuSelection('images-pane'));
      }
    },
  });
};
