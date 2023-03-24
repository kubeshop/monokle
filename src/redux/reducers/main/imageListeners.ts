import {isEqual} from 'lodash';

import {AppListenerFn} from '@redux/listeners/base';
import {getActiveResourceMetaMapFromState} from '@redux/selectors/resourceMapGetters';
import {activeResourceStorageSelector} from '@redux/selectors/resourceMapSelectors';

import {ImageMapType} from '@shared/models/appState';
import {ResourceMetaMap} from '@shared/models/k8sResource';

import {setExplorerSelectedSection, setLeftMenuSelection, toggleLeftMenu} from '../ui';
import {selectImage, setImageMap} from './mainSlice';

function parseImages(resourceMetaMap: ResourceMetaMap) {
  let imageMap: ImageMapType = {};

  Object.values(resourceMetaMap).forEach(k8sResource => {
    if (k8sResource.refs?.length) {
      k8sResource.refs.forEach(ref => {
        if (ref.type === 'outgoing' && ref.target?.type === 'image') {
          const refName = ref.name;
          const refTag = ref.target?.tag || 'latest';

          const imageId = `${refName}:${refTag}`;

          const foundImage = imageMap[imageId];

          if (!foundImage) {
            imageMap[imageId] = {id: imageId, name: refName, tag: refTag, resourcesIds: [k8sResource.id]};
          } else if (!foundImage.resourcesIds.includes(k8sResource.id)) {
            foundImage.resourcesIds.push(k8sResource.id);
          }
        }
      });
    }
  });

  return imageMap;
}

export const imageListParserListener: AppListenerFn = listen => {
  listen({
    predicate: (action, currentState, previousState) => {
      const currentActiveStorage = activeResourceStorageSelector(currentState);
      const previousActiveStorage = activeResourceStorageSelector(previousState);
      const currentActiveResourceMetaMap = getActiveResourceMetaMapFromState(currentState);
      const previousActiveResourceMetaMap = getActiveResourceMetaMapFromState(previousState);
      return (
        currentActiveStorage !== previousActiveStorage ||
        !isEqual(currentActiveResourceMetaMap, previousActiveResourceMetaMap)
      );
    },

    effect: async (_action, {dispatch, getState}) => {
      const activeResourceMetaMap = getActiveResourceMetaMapFromState(getState());

      const imageMap = getState().main.imageMap;
      const newImageMap = parseImages(activeResourceMetaMap);

      if (!isEqual(newImageMap, imageMap)) {
        dispatch(setImageMap(newImageMap));
      }
    },
  });
};

export const imageSelectedListener: AppListenerFn = listen => {
  listen({
    type: selectImage.type,
    effect: async (_action, {dispatch, getState}) => {
      const explorerSelectedSection = getState().ui.explorerSelectedSection;
      const leftMenu = getState().ui.leftMenu;

      if (!leftMenu.isActive) {
        dispatch(toggleLeftMenu());
      }

      if (leftMenu.selection !== 'explorer') {
        dispatch(setLeftMenuSelection('explorer'));
      }

      if (explorerSelectedSection !== 'images') {
        dispatch(setExplorerSelectedSection('images'));
      }
    },
  });
};
