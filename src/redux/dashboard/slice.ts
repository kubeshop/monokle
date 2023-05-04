import {Draft, PayloadAction, createSlice} from '@reduxjs/toolkit';

import {setCurrentContext} from '@redux/appConfig';
import {connectCluster} from '@redux/cluster/thunks/connect';

import {DashboardMenu, DashboardState} from '@shared/models/dashboard';
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
    setDashboardSelectedResourceId: (state: Draft<DashboardState>, action: PayloadAction<string | undefined>) => {
      state.tableDrawer.selectedResourceId = action.payload;
    },
    setActiveTab: (state: Draft<DashboardState>, action: PayloadAction<'Info' | 'Manifest'>) => {
      state.ui.activeTab = action.payload;
      trackEvent('dashboard/selectTab', {tab: action.payload});
    },
  },
  extraReducers: builder => {
    builder.addCase(connectCluster.fulfilled, state => {
      state.tableDrawer.selectedResourceId = undefined;
    });
    builder.addCase(setCurrentContext, state => {
      state.ui.activeMenu = {key: 'Overview', label: 'Overview'};
    });
  },
});

export const {setActiveDashboardMenu, setDashboardMenuList, setDashboardSelectedResourceId, setActiveTab} =
  dashboardSlice.actions;

export default dashboardSlice.reducer;
