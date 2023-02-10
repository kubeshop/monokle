import {AppState} from '@shared/models/appState';
import {AppSelection} from '@shared/models/selection';

export function resetSelectionHistory(state: AppState, initial?: AppSelection[]) {
  state.selectionHistory.index = undefined;
  state.selectionHistory.previous = state.selectionHistory.current;
  state.selectionHistory.current = initial || [];
}
