import {Draft, PayloadAction} from '@reduxjs/toolkit';

import {AppState, ImageMapType} from '@shared/models/appState';
import {createSliceReducers} from '@shared/utils/redux';

export const imageReducers = createSliceReducers('main', {
  setImagesSearchedValue: (state: Draft<AppState>, action: PayloadAction<string>) => {
    state.imagesSearchedValue = action.payload;
  },
  setImageMap: (state: Draft<AppState>, action: PayloadAction<ImageMapType>) => {
    state.imageMap = action.payload;
  },
});
