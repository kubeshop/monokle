import {IMenu} from '@components/organisms/DashboardPane/menu';

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

export type DashboardState = {
  isOpen: boolean;
  ui: {
    activeMenu: IMenu;
    selectedNamespaces: string[];
    activeTab: 'Info' | 'Manifest';
  };
  tableDrawer: {
    selectedResourceId?: string;
  };
};
