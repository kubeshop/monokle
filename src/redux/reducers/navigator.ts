import {Draft, PayloadAction, createSlice} from '@reduxjs/toolkit';

import {ItemInstance, NavigatorInstanceState, NavigatorState, SectionInstance} from '@models/navigator';

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
      Object.entries(rowsByRootSectionId).forEach(([sectionId, rows]) => {
        state.rowsByRootSectionId[sectionId] = rows;
      });
      Object.entries(rowIndexToScrollByRootSectionId).forEach(([sectionId, rowIndexToScroll]) => {
        state.rowIndexToScrollByRootSectionId[sectionId] = rowIndexToScroll;
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
    updateSectionInstance: (
      state: Draft<NavigatorState>,
      action: PayloadAction<{sectionInstance: SectionInstance; itemInstanceMap: Record<string, ItemInstance>}>
    ) => {
      const {sectionInstance, itemInstanceMap} = action.payload;
      state.sectionInstanceMap[sectionInstance.id] = sectionInstance;
      Object.keys(itemInstanceMap).forEach(id => {
        state.itemInstanceMap[id] = itemInstanceMap[id];
      });
    },
  },
});

export const {updateNavigatorInstanceState, updateSectionInstance, collapseSectionIds, expandSectionIds} =
  navigatorSlice.actions;
export default navigatorSlice.reducer;
