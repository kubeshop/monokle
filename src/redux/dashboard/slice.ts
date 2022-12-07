import {Draft, PayloadAction, createSlice} from '@reduxjs/toolkit';

import {IMenu} from '@components/organisms/DashboardPane/menu';

import {trackEvent} from '@utils/telemetry';

import {DashboardState, initialState} from './state';

export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setActiveDashboardMenu: (state: Draft<DashboardState>, action: PayloadAction<IMenu>) => {
      state.ui.activeMenu = action.payload;
    },
    setSelectedNamespaces: (state: Draft<DashboardState>, action: PayloadAction<string[]>) => {
      state.ui.selectedNamespaces = action.payload && action.payload.length > 0 ? [...action.payload] : [];
    },
    setSelectedResourceId: (state: Draft<DashboardState>, action: PayloadAction<string | undefined>) => {
      state.tableDrawer.selectedResourceId = action.payload;
    },
    setActiveTab: (state: Draft<DashboardState>, action: PayloadAction<'Info' | 'Manifest'>) => {
      state.ui.activeTab = action.payload;
      trackEvent('dashboard/selectTab', {tab: action.payload});
    },
  },
});

export const {setActiveDashboardMenu, setSelectedNamespaces, setSelectedResourceId, setActiveTab} =
  dashboardSlice.actions;

export default dashboardSlice.reducer;
