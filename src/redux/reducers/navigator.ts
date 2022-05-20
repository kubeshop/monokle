import {Draft, PayloadAction, createSlice} from '@reduxjs/toolkit';

import {NavigatorInstanceState, NavigatorState} from '@models/navigator';

import initialState from '@redux/initialState';

export const navigatorSlice = createSlice({
  name: 'navigator',
  initialState: initialState.navigator,
  reducers: {
    updateNavigatorInstanceState: (state: Draft<NavigatorState>, action: PayloadAction<NavigatorInstanceState>) => {
      const {sectionInstanceMap, itemInstanceMap, rowsByRootSectionId, rowIndexToScrollByRootSectionId} =
        action.payload;
      state.sectionInstanceMap = sectionInstanceMap;
      state.itemInstanceMap = itemInstanceMap;
      state.rowsByRootSectionId = rowsByRootSectionId;
      state.rowIndexToScrollByRootSectionId = rowIndexToScrollByRootSectionId;
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
    registerSectionBlueprint: (state: Draft<NavigatorState>, action: PayloadAction<string>) => {
      state.registeredSectionBlueprintIds.push(action.payload);
    },
    removeSectionBlueprint: (state: Draft<NavigatorState>, action: PayloadAction<string>) => {
      state.registeredSectionBlueprintIds = state.registeredSectionBlueprintIds.filter(id => id !== action.payload);
    },
  },
});

export const {
  updateNavigatorInstanceState,
  collapseSectionIds,
  expandSectionIds,
  registerSectionBlueprint,
  removeSectionBlueprint,
} = navigatorSlice.actions;
export default navigatorSlice.reducer;
