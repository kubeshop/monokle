import {Draft, PayloadAction, createSlice} from '@reduxjs/toolkit';

import {setCurrentContext} from '@redux/appConfig';
import {connectCluster} from '@redux/cluster/thunks/connect';

import {DashboardAccordionType, DashboardMenu, DashboardState} from '@shared/models/dashboard';
import {trackEvent} from '@shared/utils/telemetry';

import {initialState} from './state';

export type SelectedTab = {
  tab: 'Info' | 'Manifest' | 'Logs' | 'Shell';
  kind?: string;
};

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
    setActiveTab: (state: Draft<DashboardState>, action: PayloadAction<SelectedTab>) => {
      state.ui.activeTab = action.payload.tab;
      trackEvent('dashboard/selectTab', {tab: action.payload.tab, kind: action.payload.kind});
    },
    setDashboardActiveAccordion: (state: Draft<DashboardState>, action: PayloadAction<DashboardAccordionType>) => {
      state.ui.activeAccordion = action.payload;
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

export const {
  setActiveDashboardMenu,
  setDashboardMenuList,
  setDashboardSelectedResourceId,
  setActiveTab,
  setDashboardActiveAccordion,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
