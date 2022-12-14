import {DashboardState} from '@shared/models/dashboard';

export const initialState: DashboardState = {
  isOpen: false,
  ui: {
    activeMenu: {key: 'Overview', label: 'Overview'},
    selectedNamespaces: [],
    activeTab: 'Info',
  },
  tableDrawer: {
    selectedResourceId: undefined,
  },
};
