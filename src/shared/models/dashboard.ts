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

export type DashboardAccordionType = 'cluster-resources' | 'helm-releases';
export type DashboardActiveTab = 'Info' | 'Manifest' | 'Logs' | 'Shell' | 'Graph';

export type DashboardState = {
  isOpen: boolean;
  ui: {
    activeAccordion: 'cluster-resources' | 'helm-releases';
    activeMenu: DashboardMenu;
    activeTab: DashboardActiveTab;
    menuList: Array<DashboardMenu>;
  };
  tableDrawer: {
    selectedResourceId?: string;
  };
};
