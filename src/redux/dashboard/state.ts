import {DashboardState} from '@shared/models/dashboard';

export const initialState: DashboardState = {
  isOpen: false,
  ui: {
    activeAccordion: 'cluster-resources',
    activeMenu: {key: 'Overview', label: 'Overview'},
    activeTab: 'Info',
    menuList: [],
  },
  tableDrawer: {},
  helm: {
    helmReleases: null,
    selectedHelmRelease: null,
    activeHelmReleaseTab: 'cluster-resources',
  },
  selectedImage: null,
};
