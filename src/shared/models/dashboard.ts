export type DashboardMenu = {
  key: string;
  label: string;
  icon?: string;
  order?: number;
  resourceCount?: number;
  errorCount?: number;
  warningCount?: number;
  children?: DashboardMenu[];
};

export type DashboardActiveTab = 'Info' | 'Manifest' | 'Logs' | 'Shell';

export type DashboardState = {
  isOpen: boolean;
  ui: {
    activeMenu: DashboardMenu;
    activeTab: DashboardActiveTab;
    menuList: Array<DashboardMenu>;
  };
  tableDrawer: {
    selectedResourceId?: string;
  };
};
