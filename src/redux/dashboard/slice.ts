import {Draft, PayloadAction, createSlice} from '@reduxjs/toolkit';

import {setCurrentContext} from '@redux/appConfig';
import {connectCluster} from '@redux/cluster/thunks/connect';
import {loadClusterResources, reloadClusterResources, stopClusterConnection} from '@redux/thunks/cluster';

import {DashboardAccordionType, DashboardMenu, DashboardState, HelmReleaseTab} from '@shared/models/dashboard';
import {ImageType} from '@shared/models/image';
import {HelmRelease} from '@shared/models/ui';
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
    setSelectedHelmRelease: (state: Draft<DashboardState>, action: PayloadAction<HelmRelease | null>) => {
      state.helm.selectedHelmRelease = action.payload;
    },
    setSelectedHelmReleaseTab: (state: Draft<DashboardState>, action: PayloadAction<HelmReleaseTab>) => {
      state.helm.activeHelmReleaseTab = action.payload;
    },
    setSelectedImage: (state: Draft<DashboardState>, action: PayloadAction<ImageType | null>) => {
      state.selectedImage = action.payload;
    },
    setHelmReleases: (state: Draft<DashboardState>, action: PayloadAction<HelmRelease[] | null>) => {
      state.helm.helmReleases = action.payload;
    },
  },
  extraReducers: builder => {
    builder.addCase(connectCluster.fulfilled, state => {
      state.tableDrawer.selectedResourceId = undefined;
    });
    builder.addCase(stopClusterConnection.fulfilled, state => {
      state.helm.selectedHelmRelease = null;
      state.selectedImage = null;
    });

    builder.addCase(loadClusterResources.fulfilled, state => {
      state.helm.selectedHelmRelease = null;
      state.selectedImage = null;
    });

    builder.addCase(reloadClusterResources.fulfilled, state => {
      state.helm.selectedHelmRelease = null;
      state.selectedImage = null;
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
  setSelectedHelmRelease,
  setSelectedImage,
  setSelectedHelmReleaseTab,
  setHelmReleases,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
