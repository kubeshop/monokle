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
    selectedHelmRelease: null,
  },
  selectedImage: null,
};
