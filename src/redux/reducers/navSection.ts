import {createSlice, Draft, PayloadAction} from '@reduxjs/toolkit';
import initialState from '@redux/initialState';
import {NavSectionState, UpdateNavSectionStatePayload} from '@models/navsection';

export const navSectionSlice = createSlice({
  name: 'navSection',
  initialState: initialState.navSection,
  reducers: {
    updateNavSectionState: (state: Draft<NavSectionState>, action: PayloadAction<UpdateNavSectionStatePayload>) => {
      const {instances, itemInstances, scopeMap} = action.payload;
      instances.forEach(instance => {
        state.instanceMap[instance.name] = instance;
      });
      itemInstances.forEach(itemInstance => {
        state.itemInstanceMap[itemInstance.id];
      });
      state.scopeMap = scopeMap;
    },
  },
});

export const {updateNavSectionState} = navSectionSlice.actions;
export default navSectionSlice.reducer;
