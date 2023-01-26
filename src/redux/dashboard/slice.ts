import {Draft, PayloadAction, createSlice} from '@reduxjs/toolkit';

import {DashboardMenu, DashboardState} from '@shared/models/dashboard';
import {ResourceSelection} from '@shared/models/selection';
import {trackEvent} from '@shared/utils/telemetry';

import {initialState} from './state';

export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setActiveDashboardMenu: (state: Draft<DashboardState>, action: PayloadAction<DashboardMenu>) => {
      state.ui.activeMenu = action.payload;
    },
    setDashboardMenuList: (state: Draft<DashboardState>, action: PayloadAction<Array<DashboardMenu>>) => {
      state.ui.menuList = action.payload;
    },
    setDashboardSelection: (
      state: Draft<DashboardState>,
      action: PayloadAction<ResourceSelection<'cluster'> | undefined>
    ) => {
      state.tableDrawer.resourceSelection = action.payload;
    },
    setActiveTab: (state: Draft<DashboardState>, action: PayloadAction<'Info' | 'Manifest'>) => {
      state.ui.activeTab = action.payload;
      trackEvent('dashboard/selectTab', {tab: action.payload});
    },
  },
});

export const {setActiveDashboardMenu, setDashboardMenuList, setDashboardSelection, setActiveTab} =
  dashboardSlice.actions;

export default dashboardSlice.reducer;
