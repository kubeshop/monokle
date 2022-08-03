interface TerminalType {
  id: string;
  isRunning: boolean;
  defaultCommand?: string;
}

interface TerminalSettingsType {
  fontSize: number;
}

interface TerminalState {
  settings: TerminalSettingsType;
  terminalsMap: Record<string, TerminalType>;
  selectedTerminal?: string;
  webContentsId?: number;
}

export type {TerminalSettingsType, TerminalState, TerminalType};
