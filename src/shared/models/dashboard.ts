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

export type DashboardState = {
  isOpen: boolean;
  ui: {
    activeMenu: DashboardMenu;
    activeTab: 'Info' | 'Manifest' | 'Logs' | 'Shell';
    menuList: Array<DashboardMenu>;
  };
  tableDrawer: {
    selectedResourceId?: string;
  };
};
