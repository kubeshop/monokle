import {defineHotkey} from '@shared/utils/hotkey';

import {HotkeyConf} from '../models/hotkeys';

export const hotkeys = createHotkeys({
  TOGGLE_SETTINGS: {
    name: 'Toggle Settings',
    key: `ctrl+, Meta+,`,
    category: 'tool',
  },
  LOAD_CLUSTER: {
    name: 'Load Cluster',
    key: 'ctrl+i, Meta+i',
    category: 'tool',
  },
  EXIT_PREVIEW_MODE: {
    name: 'Exit Preview Mode',
    key: 'esc',
    category: 'tool',
  },
  SELECT_FOLDER: {
    name: 'Select Folder',
    key: 'ctrl+o, Meta+o',
    category: 'tool',
  },
  REFRESH_FOLDER: {
    name: 'Refresh Folder',
    key: 'ctrl+f5, Meta+f5',
    category: 'tool',
  },
  TOGGLE_LEFT_PANE: {
    name: 'Toggle Left Pane',
    key: 'ctrl+b, Meta+b',
    category: 'navigation',
  },
  ZOOM_IN: {
    name: 'Zoom in',
    key: 'ctrl+=, Meta+=',
    category: 'tool',
  },
  ZOOM_OUT: {
    name: 'Zoom out',
    key: 'ctrl+-, Meta+-',
    category: 'tool',
  },
  SAVE: {
    name: 'Save',
    key: 'ctrl+s, Meta+s',
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
    name: 'Open New Resource Wizard',
    key: 'ctrl+n, Meta+n',
    category: 'navigation',
  },
  CREATE_NEW_RESOURCE: {
    name: 'Create new Resource',
    key: 'shift+enter',
    category: 'tool',
  },
  APPLY_SELECTION: {
    name: 'Apply Selection',
    key: 'ctrl+alt+s, Meta+alt+s',
    category: 'tool',
  },
  DIFF_RESOURCE: {
    name: 'Diff Resource',
    key: 'ctrl+alt+d, Meta+alt+d',
    category: 'tool',
  },
  OPEN_EXPLORER_TAB: {
    name: 'Open Explorer Tab',
    key: 'ctrl+shift+e, Meta+shift+e',
    category: 'navigation',
  },
  OPEN_VALIDATION_TAB: {
    name: 'Open Validation Tab',
    key: 'ctrl+shift+v, Meta+shift+v',
    category: 'navigation',
  },
  TOGGLE_TERMINAL_PANE: {
    name: 'Toggle Terminal Pane',
    key: 'ctrl+`, Meta+`',
    category: 'navigation',
  },
  RESET_RESOURCE_FILTERS: {
    name: 'Reset Resource Filters',
    key: 'ctrl+alt+r, Meta+alt+r',
    category: 'tool',
  },
  OPEN_QUICK_SEARCH: {
    name: 'Open Quick Search',
    key: 'ctrl+p, ctrl+shift+p, Meta+p, Meta+shift+p',
    category: 'navigation',
  },
  OPEN_NEW_WINDOW: {
    name: 'Open New Window',
    key: 'ctrl+shift+n, Meta+shift+n',
    category: 'navigation',
  },
  OPEN_SHORTCUTS: {
    name: 'Open Shortcuts',
    key: 'ctrl+/, Meta+/',
    category: 'tool',
  },
  RELOAD_PREVIEW: {
    name: 'Reload Preview',
    key: 'ctrl+r, Meta+r',
    category: 'tool',
  },
  DELETE_RESOURCE: {
    name: 'Delete Resource',
    key: 'ctrl+backspace, Meta+backspace',
    category: 'tool',
  },
  SCALE: {
    name: 'Scale replicas',
    key: 'ctrl+shift+s, Meta+shift+s',
    category: 'tool',
  },
});

function createHotkeys<TName extends string>(config: Record<TName, HotkeyConf>) {
  return Object.fromEntries(
    Object.entries(config).map(entry => {
      const [name, conf] = entry as [TName, HotkeyConf];
      return [
        name,
        {
          ...conf,
          key: defineHotkey(conf.key),
        },
      ];
    })
  );
}
