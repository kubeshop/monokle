export type DashboardState = {
  isOpen: boolean;
  ui: {
    activeMenu: string;
    selectedNamespace: string;
  };
  tableDrawer: {
    selectedResourceId?: string;
  };
};
