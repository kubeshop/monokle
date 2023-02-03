import {Draft, PayloadAction} from '@reduxjs/toolkit';

import {AppState, ImagesListType} from '@shared/models/appState';
import {createSliceReducers} from '@shared/utils/redux';

export const imageReducers = createSliceReducers('main', {
  setImagesSearchedValue: (state: Draft<AppState>, action: PayloadAction<string>) => {
    state.imagesSearchedValue = action.payload;
  },
  setImagesList: (state: Draft<AppState>, action: PayloadAction<ImagesListType>) => {
    state.imagesList = action.payload;
  },
});

// TODO: this has to be reimplemented based on the validation library to get the refs?!
// function getImages(resourceMap: ResourceMap) {
//   let images: ImagesListType = [];

//   Object.values(resourceMap).forEach(k8sResource => {
//     if (k8sResource.refs?.length) {
//       k8sResource.refs.forEach(ref => {
//         if (ref.type === 'outgoing' && ref.target?.type === 'image') {
//           const refName = ref.name;
//           const refTag = ref.target?.tag || 'latest';

//           const foundImage = images.find(image => image.id === `${refName}:${refTag}`);

//           if (!foundImage) {
//             images.push({id: `${refName}:${refTag}`, name: refName, tag: refTag, resourcesIds: [k8sResource.id]});
//           } else if (!foundImage.resourcesIds.includes(k8sResource.id)) {
//             foundImage.resourcesIds.push(k8sResource.id);
//           }
//         }
//       });
//     }
//   });

//   return images;
// }

// export const resourceMapChangedListener: AppListenerFn = listen => {
//   listen({
//     predicate: (action, currentState, previousState) => {
//       return (
//         !isEqual(currentState.main.resourceMap, previousState.main.resourceMap) ||
//         !isEqual(currentState.main.resourceFilter, previousState.main.resourceFilter)
//       );
//     },

//     effect: async (_action, {dispatch, getState}) => {
//       const resourceFilter = getState().main.resourceFilter;
//       const resourceMap = getActiveResourceMap(getState().main);

//       const currentResourcesMap = Object.fromEntries(
//         Object.entries(resourceMap).filter(([, value]) => isResourcePassingFilter(value, resourceFilter))
//       );

//       const imagesList = getState().main.imagesList;
//       const images = getImages(currentResourcesMap);

//       if (!isEqual(images, imagesList)) {
//         dispatch(setImagesList(images));
//       }
//     },
//   });
// };

// export const imageSelectedListener: AppListenerFn = listen => {
//   listen({
//     type: selectImage.type,
//     effect: async (_action, {dispatch, getState}) => {
//       const leftMenu = getState().ui.leftMenu;

//       if (!leftMenu.isActive) {
//         dispatch(toggleLeftMenu());
//       }

//       if (leftMenu.selection !== 'images-pane') {
//         dispatch(setLeftMenuSelection('images-pane'));
//       }
//     },
//   });
// };
