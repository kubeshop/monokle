import {IMenu} from '@components/organisms/DashboardPane/menu';

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

export type DashboardState = {
  isOpen: boolean;
  ui: {
    activeMenu: IMenu;
    activeTab: 'Info' | 'Manifest';
    menuList: Array<IMenu>;
  };
  tableDrawer: {
    selectedResourceId?: string;
  };
};
