import {K8sResource} from './k8sResource';

type ShellType = {
  name: string;
  shell: string;
};

type ShellsMapType = Record<string, ShellType>;

type TerminalType = {
  id: string;
  isRunning: boolean;
  shell: string;
  defaultCommand?: string;
  pod?: K8sResource;
};

type TerminalSettingsType = {
  defaultShell: string;
  fontSize: number;
};

type TerminalState = {
  settings: TerminalSettingsType;
  shellsMap: ShellsMapType;
  terminalsMap: Record<string, TerminalType>;
  selectedTerminal?: string;
  webContentsId?: number;
  height?: number;
};

export type {ShellType, ShellsMapType, TerminalSettingsType, TerminalState, TerminalType};
