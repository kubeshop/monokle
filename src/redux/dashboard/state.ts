export const initialState: DashboardState = {
  isOpen: false,
  ui: {
    activeMenu: 'Overview',
    selectedNamespace: 'ALL',
  },
  tableDrawer: {
    selectedResourceId: undefined,
  },
};

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
