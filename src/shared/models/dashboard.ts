import {ResourceSelection} from './selection';

export type DashboardMenu = {
  key: string;
  label: string;
  icon?: string;
  order?: number;
  resourceCount?: number;
  errorCount?: number;
  children?: DashboardMenu[];
};

export type DashboardState = {
  isOpen: boolean;
  ui: {
    activeMenu: DashboardMenu;
    activeTab: 'Info' | 'Manifest';
  };
  tableDrawer: {
    resourceSelection?: ResourceSelection<'cluster'>;
  };
};
