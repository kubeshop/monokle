interface TerminalType {
  id: string;
  isRunning: boolean;
  defaultCommand?: string;
}

interface TerminalState {
  terminalsMap: Record<string, TerminalType>;
  selectedTerminal?: string;
  webContentsId?: number;
}

export type {TerminalState, TerminalType};
