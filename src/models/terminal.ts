interface TerminalState {
  runningTerminals: string[];
  selectedTerminal?: string;
  webContentsId?: number;
}

export type {TerminalState};
