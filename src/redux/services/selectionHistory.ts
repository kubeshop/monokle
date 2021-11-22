import {AppState, SelectionHistoryEntry} from '@models/appstate';

type resetSelectionHistoryOptions = {
  initialPaths?: (string | undefined)[];
  initialResourceIds?: (string | undefined)[];
  initialEntries?: SelectionHistoryEntry[];
};

export function resetSelectionHistory(state: AppState, options?: resetSelectionHistoryOptions) {
  state.currentSelectionHistoryIndex = undefined;
  if (!options) {
    return;
  }
  const newSelectionHistory: SelectionHistoryEntry[] = [];
  if (options.initialEntries) {
    newSelectionHistory.push(...options.initialEntries);
  }
  if (options.initialPaths) {
    options.initialPaths.forEach(path => {
      if (path !== undefined) {
        newSelectionHistory.push({
          type: 'path',
          selectedPath: path,
        });
      }
    });
  }
  if (options.initialResourceIds) {
    options.initialResourceIds.forEach(resourceId => {
      if (resourceId !== undefined) {
        newSelectionHistory.push({
          type: 'resource',
          selectedResourceId: resourceId,
        });
      }
    });
  }
  state.selectionHistory = newSelectionHistory;
}
