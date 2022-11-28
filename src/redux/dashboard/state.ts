import {DashboardState} from '@shared/models/dashboard';

export const initialState: DashboardState = {
  isOpen: false,
  ui: {
    activeMenu: 'Overview',
    selectedNamespace: 'ALL',
  },
  tableDrawer: {
    selectedResourceId: undefined,
  },
};
