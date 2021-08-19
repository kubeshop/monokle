import {selectFile, selectK8sResource} from '@redux/reducers/main';
import {AppDispatch, RootState} from '@redux/store';
import {createAsyncThunk} from '@reduxjs/toolkit';

export const selectFromHistory = createAsyncThunk<
  number | undefined,
  {direction: 'left' | 'right'},
  {dispatch: AppDispatch; state: RootState}
>('main/selectFromHistory', async (payload, thunkAPI) => {
  const mainState = thunkAPI.getState().main;
  const direction = payload.direction;
  const currentSelectionHistoryIndex = mainState.currentSelectionHistoryIndex;
  const selectionHistory = mainState.selectionHistory;

  if (selectionHistory.length === 0) {
    return;
  }

  let nextSelectionHistoryIndex: number | null = null;

  if (direction === 'left') {
    if (currentSelectionHistoryIndex === 0) {
      return;
    }
    nextSelectionHistoryIndex = currentSelectionHistoryIndex
      ? currentSelectionHistoryIndex - 1
      : selectionHistory.length - 2;
  } else if (direction === 'right') {
    if (!currentSelectionHistoryIndex || currentSelectionHistoryIndex === selectionHistory.length - 1) {
      return;
    }
    nextSelectionHistoryIndex = currentSelectionHistoryIndex + 1;
  }

  if (!nextSelectionHistoryIndex) {
    return;
  }

  const selectionHistoryEntry = selectionHistory[nextSelectionHistoryIndex];
  if (selectionHistoryEntry.type === 'resource') {
    thunkAPI.dispatch(
      selectK8sResource({resourceId: selectionHistoryEntry.selectedResourceId, isVirtualSelection: true})
    );
  }
  if (selectionHistoryEntry.type === 'path') {
    thunkAPI.dispatch(selectFile({filePath: selectionHistoryEntry.selectedPath, isVirtualSelection: true}));
  }

  return nextSelectionHistoryIndex;
});
