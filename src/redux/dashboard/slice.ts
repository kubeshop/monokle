import {Draft, PayloadAction, createSlice} from '@reduxjs/toolkit';

import {IMenu} from '@components/organisms/DashboardPane/menu';

import {DashboardState, initialState} from './state';

export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setActiveDashboardMenu: (state: Draft<DashboardState>, action: PayloadAction<IMenu>) => {
      state.ui.activeMenu = action.payload;
    },
    setSelectedNamespace: (state: Draft<DashboardState>, action: PayloadAction<string>) => {
      state.ui.selectedNamespace = action.payload;
    },
    setSelectedResourceId: (state: Draft<DashboardState>, action: PayloadAction<string | undefined>) => {
      state.tableDrawer.selectedResourceId = action.payload;
    },
    setActiveTab: (state: Draft<DashboardState>, action: PayloadAction<'Info' | 'Manifest'>) => {
      state.ui.activeTab = action.payload;
    },
  },
});

export const {setActiveDashboardMenu, setSelectedNamespace, setSelectedResourceId, setActiveTab} =
  dashboardSlice.actions;

export default dashboardSlice.reducer;
