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
