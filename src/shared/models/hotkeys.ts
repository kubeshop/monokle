import {hotkeys} from '../constants/hotkeys';

export type Hotkey = keyof typeof hotkeys;

export type HotkeyConf = {
  name: string;
  key: string;
  category: 'navigation' | 'tool';
};
