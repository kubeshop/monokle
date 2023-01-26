import {DashboardState} from '@shared/models/dashboard';

export const initialState: DashboardState = {
  isOpen: false,
  ui: {
    activeMenu: {key: 'Overview', label: 'Overview'},
    activeTab: 'Info',
    menuList: [],
  },
  tableDrawer: {
    selectedResourceId: undefined,
  },
};
