import {K8sResource} from '@monokle-desktop/shared';

interface ShellType {
  name: string;
  shell: string;
}

type ShellsMapType = Record<string, ShellType>;

interface TerminalType {
  id: string;
  isRunning: boolean;
  shell: string;
  defaultCommand?: string;
  pod?: K8sResource;
}

interface TerminalSettingsType {
  defaultShell: string;
  fontSize: number;
}

interface TerminalState {
  settings: TerminalSettingsType;
  shellsMap: ShellsMapType;
  terminalsMap: Record<string, TerminalType>;
  selectedTerminal?: string;
  webContentsId?: number;
}

export type {ShellType, ShellsMapType, TerminalSettingsType, TerminalState, TerminalType};
