import {selectFile, selectK8sResource} from '@redux/reducers/main';
import {AppDispatch, RootState} from '@redux/store';
import {createAsyncThunk} from '@reduxjs/toolkit';

import {SelectionHistoryEntry} from '@models/appstate';

export const selectFromHistory = createAsyncThunk<
  {
    newSelectionHistory: SelectionHistoryEntry[];
    nextSelectionHistoryIndex?: number;
  },
  {direction: 'left' | 'right'},
  {dispatch: AppDispatch; state: RootState}
>('main/selectFromHistory', async (payload, thunkAPI) => {
  const mainState = thunkAPI.getState().main;
  const direction = payload.direction;
  let currentSelectionHistoryIndex = mainState.currentSelectionHistoryIndex;
  const selectionHistory = mainState.selectionHistory;

  let removedSelectionHistoryEntriesCount = 0;
  const newSelectionHistory = selectionHistory.filter(historyEntry => {
    if (historyEntry.type === 'resource') {
      if (mainState.resourceMap[historyEntry.selectedResourceId] !== undefined) {
        return true;
      }
    }
    if (historyEntry.type === 'path') {
      if (mainState.fileMap[historyEntry.selectedPath] !== undefined) {
        return true;
      }
    }
    removedSelectionHistoryEntriesCount += 1;
    return false;
  });

  if (
    currentSelectionHistoryIndex !== undefined &&
    currentSelectionHistoryIndex - removedSelectionHistoryEntriesCount >= 0
  ) {
    currentSelectionHistoryIndex -= removedSelectionHistoryEntriesCount;
  }

  const canNavigateLeft =
    selectionHistory.length > 1 &&
    (currentSelectionHistoryIndex === undefined || (currentSelectionHistoryIndex && currentSelectionHistoryIndex > 0));
  const canNavigateRight =
    selectionHistory.length > 1 &&
    currentSelectionHistoryIndex !== undefined &&
    currentSelectionHistoryIndex < selectionHistory.length - 1;

  if (
    newSelectionHistory.length === 0 ||
    (direction === 'left' && !canNavigateLeft) ||
    (direction === 'right' && !canNavigateRight)
  ) {
    return {newSelectionHistory, nextSelectionHistoryIndex: currentSelectionHistoryIndex};
  }

  let nextSelectionHistoryIndex: number | null = null;

  if (direction === 'left') {
    if (
      currentSelectionHistoryIndex === undefined ||
      (currentSelectionHistoryIndex && currentSelectionHistoryIndex >= 0)
    ) {
      nextSelectionHistoryIndex =
        currentSelectionHistoryIndex !== undefined ? currentSelectionHistoryIndex - 1 : newSelectionHistory.length - 2;
    }
  } else if (direction === 'right') {
    if (currentSelectionHistoryIndex !== undefined && currentSelectionHistoryIndex <= newSelectionHistory.length - 1) {
      nextSelectionHistoryIndex = currentSelectionHistoryIndex + 1;
    }
  }

  if (nextSelectionHistoryIndex === null) {
    return {newSelectionHistory, nextSelectionHistoryIndex: currentSelectionHistoryIndex};
  }

  const selectionHistoryEntry = newSelectionHistory[nextSelectionHistoryIndex];
  if (selectionHistoryEntry.type === 'resource') {
    thunkAPI.dispatch(
      selectK8sResource({resourceId: selectionHistoryEntry.selectedResourceId, isVirtualSelection: true})
    );
  }
  if (selectionHistoryEntry.type === 'path') {
    thunkAPI.dispatch(selectFile({filePath: selectionHistoryEntry.selectedPath, isVirtualSelection: true}));
  }

  return {newSelectionHistory, nextSelectionHistoryIndex};
});
