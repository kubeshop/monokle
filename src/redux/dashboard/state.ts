import {IMenu} from '@components/organisms/DashboardPane/menu';

export const initialState: DashboardState = {
  isOpen: false,
  ui: {
    activeMenu: {key: 'Overview', label: 'Overview'},
    selectedNamespace: 'ALL',
    activeTab: 'Info',
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
    activeTab: 'Info' | 'Manifest';
  };
  tableDrawer: {
    selectedResourceId?: string;
  };
};
