import {K8sResource} from './k8sresource';

interface TerminalType {
  id: string;
  isRunning: boolean;
  defaultCommand?: string;
  pod?: K8sResource;
}

interface TerminalSettingsType {
  fontSize: number;
}

interface TerminalState {
  settings: TerminalSettingsType;
  shells: string[];
  terminalsMap: Record<string, TerminalType>;
  selectedTerminal?: string;
  webContentsId?: number;
}

export type {TerminalSettingsType, TerminalState, TerminalType};
