import {IMenu} from '@components/organisms/DashboardPane/menu';

export const initialState: DashboardState = {
  isOpen: false,
  ui: {
    activeMenu: {key: 'Overview', label: 'Overview', children: []},
    selectedNamespace: 'ALL',
  },
  tableDrawer: {
    selectedResourceId: undefined,
  },
};

export type DashboardState = {
  isOpen: boolean;
  ui: {
    activeMenu: IMenu;
    selectedNamespace: string;
  };
  tableDrawer: {
    selectedResourceId?: string;
  };
};
