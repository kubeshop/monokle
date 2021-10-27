import {createSlice, Draft, PayloadAction} from '@reduxjs/toolkit';
import initialState from '@redux/initialState';
import {NavigatorState} from '@models/navigator';

export const navigatorSlice = createSlice({
  name: 'navigator',
  initialState: initialState.navigator,
  reducers: {
    updateNavigatorState: (state: Draft<NavigatorState>, action: PayloadAction<NavigatorState>) => {
      const {sectionInstanceMap, itemInstanceMap} = action.payload;
      Object.entries(sectionInstanceMap).forEach(([sectionId, sectionInstance]) => {
        state.sectionInstanceMap[sectionId] = sectionInstance;
      });
      Object.entries(itemInstanceMap).forEach(([itemId, itemInstance]) => {
        state.itemInstanceMap[itemId] = itemInstance;
      });
    },
  },
});

export const {updateNavigatorState} = navigatorSlice.actions;
export default navigatorSlice.reducer;
