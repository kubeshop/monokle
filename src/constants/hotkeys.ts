export type Hotkey = keyof typeof hotkeys;

type HotkeyConf = {
  name: string;
  key: string;
  category: 'navigation' | 'tool';
};

export const hotkeys: Record<string, HotkeyConf> = {
  TOGGLE_SETTINGS: {
    name: 'Toggle Settings',
    key: `ctrl+\, , command+\,`,
    category: 'tool',
  },
  PREVIEW_CLUSTER: {
    name: 'Preview Cluster',
    key: 'ctrl+i, command+i',
    category: 'tool',
  },
  EXIT_PREVIEW_MODE: {
    name: 'Exit Preview Mode',
    key: 'esc',
    category: 'tool',
  },
  SELECT_FOLDER: {
    name: 'Select Folder',
    key: 'ctrl+o, command+o',
    category: 'tool',
  },
  REFRESH_FOLDER: {
    name: 'Refresh Folder',
    key: 'ctrl+f5, command+f5',
    category: 'tool',
  },
  TOGGLE_LEFT_PANE: {
    name: 'Toggle Left Pane',
    key: 'ctrl+b, command+b',
    category: 'navigation',
  },
  TOGGLE_RIGHT_PANE: {
    name: 'Toggle Right Pane',
    key: 'ctrl+alt+b, command+alt+b',
    category: 'navigation',
  },
  ZOOM_IN: {
    name: 'Zoom in',
    key: 'ctrl+=, command+=',
    category: 'tool',
  },
  ZOOM_OUT: {
    name: 'Zoom out',
    key: 'ctrl+-, command+-',
    category: 'tool',
  },
  SAVE: {
    name: 'Save',
    key: 'ctrl+s, command+s',
    category: 'tool',
  },
  SELECT_FROM_HISTORY_BACK: {
    name: 'Select from History Back',
    key: 'alt+left',
    category: 'tool',
  },
  SELECT_FROM_HISTORY_FORWARD: {
    name: 'Select from History Forward',
    key: 'alt+right',
    category: 'tool',
  },
  OPEN_NEW_RESOURCE_WIZARD: {
    name: 'Open new Resource Wizard',
    key: 'ctrl+n, cmd+n',
    category: 'navigation',
  },
  CREATE_NEW_RESOURCE: {
    name: 'Create new Resource',
    key: 'shift+enter',
    category: 'tool',
  },
  APPLY_SELECTION: {
    name: 'Apply Selection',
    key: 'ctrl+alt+s, cmd+alt+s',
    category: 'tool',
  },
  DIFF_RESOURCE: {
    name: 'Diff Resource',
    key: 'ctrl+alt+d, cmd+alt+d',
    category: 'tool',
  },
  OPEN_EXPLORER_TAB: {
    name: 'Open Explorer Tab',
    key: 'ctrl+shift+e, command+shift+e',
    category: 'navigation',
  },
  OPEN_KUSTOMIZATION_TAB: {
    name: 'Open Kustomization Tab',
    key: 'ctrl+shift+k, command+shift+k',
    category: 'navigation',
  },
  OPEN_HELM_TAB: {
    name: 'Open Helm Tab',
    key: 'ctrl+shift+h, command+shift+h',
    category: 'navigation',
  },
  OPEN_VALIDATION_TAB: {
    name: 'Open Validation Tab',
    key: 'ctrl+shift+v, command+shift+v',
    category: 'navigation',
  },
  RESET_RESOURCE_FILTERS: {
    name: 'Reset Resource Filters',
    key: 'ctrl+alt+r, command+alt+r',
    category: 'tool',
  },
  OPEN_QUICK_SEARCH: {
    name: 'Open Quick Search',
    key: 'ctrl+p, ctrl+shift+p, command+p, command+shift+p',
    category: 'navigation',
  },
  OPEN_GETTING_STARTED_PAGE: {
    name: 'Open Getting Started Page',
    key: 'ctrl+shift+t, command+shift+t',
    category: 'navigation',
  },
  OPEN_NEW_WINDOW: {
    name: 'Open New Window',
    key: 'ctrl+shift+n, command+shift+n',
    category: 'navigation',
  },
  OPEN_SHORTCUTS: {
    name: 'Open Shortcuts',
    key: 'ctrl+/, command+/',
    category: 'tool',
  },
  RELOAD_PREVIEW: {
    name: 'Reload Preview',
    key: 'ctrl+r, command+r',
    category: 'tool',
  },
  DELETE_RESOURCES: {
    name: 'Delete Resources',
    key: 'ctrl+backspace, command+backspace',
    category: 'tool',
  },
};

export default hotkeys;
