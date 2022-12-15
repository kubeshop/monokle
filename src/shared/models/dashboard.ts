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
    selectedNamespaces: string[];
    activeTab: 'Info' | 'Manifest';
  };
  tableDrawer: {
    selectedResourceId?: string;
  };
};
