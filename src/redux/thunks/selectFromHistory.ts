import {createAsyncThunk} from '@reduxjs/toolkit';

import {selectFile, selectImage, selectResource, setSelectionHistory} from '@redux/reducers/main';
import {setExplorerSelectedSection} from '@redux/reducers/ui';

import {AppDispatch} from '@shared/models/appDispatch';
import {RootState} from '@shared/models/rootState';

export const selectFromHistory = createAsyncThunk<{}, 'left' | 'right', {dispatch: AppDispatch; state: RootState}>(
  'main/selectFromHistory',
  async (payload, thunkAPI) => {
    const state = thunkAPI.getState();
    const explorerSelectedSection = state.ui.explorerSelectedSection;
    const fileMap = state.main.fileMap;
    const imageMap = state.main.imageMap;
    const resourceMetaMapByStorage = state.main.resourceMetaMapByStorage;
    const selectionHistory = state.main.selectionHistory;
    let currentSelectionHistoryIndex = selectionHistory.index;

    const direction = payload;

    let removedSelectionHistoryEntriesCount = 0;

    const newSelectionHistory = selectionHistory.current.filter(selection => {
      if (selection.type === 'resource') {
        const resource =
          resourceMetaMapByStorage[selection.resourceIdentifier.storage][selection.resourceIdentifier.id];
        if (resource) {
          return true;
        }
      }
      if (selection.type === 'file') {
        if (fileMap[selection.filePath] !== undefined) {
          return true;
        }
      }
      if (selection.type === 'image' && imageMap[selection.imageId]) {
        return true;
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
      selectionHistory.current.length > 1 &&
      (currentSelectionHistoryIndex === undefined ||
        (currentSelectionHistoryIndex && currentSelectionHistoryIndex > 0));
    const canNavigateRight =
      selectionHistory.current.length > 1 &&
      currentSelectionHistoryIndex !== undefined &&
      currentSelectionHistoryIndex < selectionHistory.current.length - 1;

    if (
      newSelectionHistory.length === 0 ||
      (direction === 'left' && !canNavigateLeft) ||
      (direction === 'right' && !canNavigateRight)
    ) {
      thunkAPI.dispatch(
        setSelectionHistory({newSelectionHistory, nextSelectionHistoryIndex: currentSelectionHistoryIndex})
      );

      return;
    }

    let nextSelectionHistoryIndex: number | null = null;

    if (direction === 'left') {
      if (
        currentSelectionHistoryIndex === undefined ||
        (currentSelectionHistoryIndex && currentSelectionHistoryIndex >= 0)
      ) {
        nextSelectionHistoryIndex =
          currentSelectionHistoryIndex !== undefined
            ? currentSelectionHistoryIndex - 1
            : newSelectionHistory.length - 2;
      }
    } else if (direction === 'right') {
      if (
        currentSelectionHistoryIndex !== undefined &&
        currentSelectionHistoryIndex <= newSelectionHistory.length - 1
      ) {
        nextSelectionHistoryIndex = currentSelectionHistoryIndex + 1;
      }
    }

    if (nextSelectionHistoryIndex === null) {
      thunkAPI.dispatch(
        setSelectionHistory({newSelectionHistory, nextSelectionHistoryIndex: currentSelectionHistoryIndex})
      );

      return;
    }

    const nextSelection = newSelectionHistory[nextSelectionHistoryIndex];

    if (nextSelection.type === 'image' && explorerSelectedSection !== 'images') {
      thunkAPI.dispatch(setExplorerSelectedSection('images'));
    } else if (nextSelection.type === 'file' && explorerSelectedSection !== 'files') {
      thunkAPI.dispatch(setExplorerSelectedSection('files'));
    }

    if (nextSelection.type === 'resource') {
      thunkAPI.dispatch(
        selectResource({resourceIdentifier: nextSelection.resourceIdentifier, isVirtualSelection: true})
      );
    }

    if (nextSelection.type === 'file') {
      thunkAPI.dispatch(selectFile({filePath: nextSelection.filePath, isVirtualSelection: true}));
    }

    if (nextSelection.type === 'image') {
      thunkAPI.dispatch(selectImage({imageId: nextSelection.imageId, isVirtualSelection: true}));
    }

    thunkAPI.dispatch(setSelectionHistory({newSelectionHistory, nextSelectionHistoryIndex}));
  }
);
