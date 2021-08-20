import {SelectionHistoryEntry, AppState} from '@models/appstate';

type resetSelectionHistoryOptions = {
  initialPaths?: (string | undefined)[];
  initialResources?: (string | undefined)[];
  initialEntries?: SelectionHistoryEntry[];
};

export function resetSelectionHistory(state: AppState, options?: resetSelectionHistoryOptions) {
  state.currentSelectionHistoryIndex = undefined;
  if (!options) {
    return;
  }
  const newSelectionHistory = [];
  if (options.initialEntries) {
    newSelectionHistory.push(...options.initialEntries);
  }
  if (options.initialPaths) {
    newSelectionHistory.push(...options.initialPaths.filter(path => path !== undefined));
  }
  if (options.initialResources) {
    newSelectionHistory.push(...options.initialResources.filter(res => res !== undefined));
  }
  return newSelectionHistory;
}
