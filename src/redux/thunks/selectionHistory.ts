import {AnyAction} from '@reduxjs/toolkit';

import {FileMapType, ImagesListType, ResourceMapType, SelectionHistoryEntry} from '@models/appstate';

import {selectFile, selectImage, selectK8sResource, setSelectionHistory} from '@redux/reducers/main';

export const selectFromHistory = async (
  direction: 'left' | 'right',
  currentSelectionHistoryIndex: number | undefined,
  selectionHistory: SelectionHistoryEntry[],
  resourceMap: ResourceMapType,
  fileMap: FileMapType,
  imagesList: ImagesListType,
  dispatch: (action: AnyAction) => void
) => {
  let removedSelectionHistoryEntriesCount = 0;
  const newSelectionHistory = selectionHistory.filter(historyEntry => {
    if (historyEntry.type === 'resource') {
      if (resourceMap[historyEntry.selectedResourceId] !== undefined) {
        return true;
      }
    }
    if (historyEntry.type === 'path') {
      if (fileMap[historyEntry.selectedPath] !== undefined) {
        return true;
      }
    }
    if (historyEntry.type === 'image') {
      if (imagesList.find(image => image.id === historyEntry.selectedImage.id)) {
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
    dispatch(setSelectionHistory({newSelectionHistory, nextSelectionHistoryIndex: currentSelectionHistoryIndex}));
    return;
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
    dispatch(setSelectionHistory({newSelectionHistory, nextSelectionHistoryIndex: currentSelectionHistoryIndex}));
    return;
  }

  const selectionHistoryEntry = newSelectionHistory[nextSelectionHistoryIndex];
  if (selectionHistoryEntry.type === 'resource') {
    dispatch(selectK8sResource({resourceId: selectionHistoryEntry.selectedResourceId, isVirtualSelection: true}));
  }
  if (selectionHistoryEntry.type === 'path') {
    dispatch(selectFile({filePath: selectionHistoryEntry.selectedPath, isVirtualSelection: true}));
  }
  if (selectionHistoryEntry.type === 'image') {
    dispatch(selectImage({image: selectionHistoryEntry.selectedImage, isVirtualSelection: true}));
  }

  dispatch(setSelectionHistory({newSelectionHistory, nextSelectionHistoryIndex}));
};
