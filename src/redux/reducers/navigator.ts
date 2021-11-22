import {Draft, PayloadAction, createSlice} from '@reduxjs/toolkit';

import {NavigatorInstanceState, NavigatorState} from '@models/navigator';

import initialState from '@redux/initialState';

export const navigatorSlice = createSlice({
  name: 'navigator',
  initialState: initialState.navigator,
  reducers: {
    updateNavigatorInstanceState: (state: Draft<NavigatorState>, action: PayloadAction<NavigatorInstanceState>) => {
      const {sectionInstanceMap, itemInstanceMap} = action.payload;
      Object.entries(sectionInstanceMap).forEach(([sectionId, sectionInstance]) => {
        state.sectionInstanceMap[sectionId] = sectionInstance;
      });
      Object.entries(itemInstanceMap).forEach(([itemId, itemInstance]) => {
        state.itemInstanceMap[itemId] = itemInstance;
      });
    },
    collapseSectionIds: (state: Draft<NavigatorState>, action: PayloadAction<string[]>) => {
      action.payload.forEach(sectionId => {
        if (!state.collapsedSectionIds.includes(sectionId)) {
          state.collapsedSectionIds.push(sectionId);
        }
      });
    },
    expandSectionIds: (state: Draft<NavigatorState>, action: PayloadAction<string[]>) => {
      state.collapsedSectionIds = state.collapsedSectionIds.filter(sectionId => !action.payload.includes(sectionId));
    },
    selectInstance: (state: Draft<NavigatorState>, action: PayloadAction<string | null>) => {
      state.selectedInstanceId = action.payload;
    },
  },
});

export const {updateNavigatorInstanceState, collapseSectionIds, expandSectionIds, selectInstance} =
  navigatorSlice.actions;
export default navigatorSlice.reducer;
