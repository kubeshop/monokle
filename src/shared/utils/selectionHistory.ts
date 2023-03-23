import {AnyAction} from '@reduxjs/toolkit';

import {FileMapType, ImagesListType} from '@shared/models/appState';
import {ResourceMetaMapByStorage} from '@shared/models/k8sResource';
import {AppSelection} from '@shared/models/selection';
import {ExplorerCollapsibleSectionsType} from '@shared/models/ui';

// TODO: this should become a thunk so we don't have to pass resourceMetaStorage to it...
export const selectFromHistory = (
  direction: 'left' | 'right',
  currentSelectionHistoryIndex: number | undefined,
  selectionHistory: AppSelection[],
  resourceMetaMapByStorage: ResourceMetaMapByStorage,
  fileMap: FileMapType,
  imagesList: ImagesListType,
  dispatch: (action: AnyAction) => void,
  explorerSelectedSection: ExplorerCollapsibleSectionsType
) => {
  let removedSelectionHistoryEntriesCount = 0;
  const newSelectionHistory = selectionHistory.filter(selection => {
    if (selection.type === 'resource') {
      const resource = resourceMetaMapByStorage[selection.resourceIdentifier.storage][selection.resourceIdentifier.id];
      if (resource) {
        return true;
      }
    }
    if (selection.type === 'file') {
      if (fileMap[selection.filePath] !== undefined) {
        return true;
      }
    }
    if (selection.type === 'image') {
      if (imagesList.find(image => image.id === selection.imageId)) {
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
    dispatch({
      type: 'main/setSelectionHistory',
      payload: {newSelectionHistory, nextSelectionHistoryIndex: currentSelectionHistoryIndex},
    });

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
    dispatch({
      type: 'main/setSelectionHistory',
      payload: {newSelectionHistory, nextSelectionHistoryIndex: currentSelectionHistoryIndex},
    });

    return;
  }

  const nextSelection = newSelectionHistory[nextSelectionHistoryIndex];

  if (nextSelection.type === 'image' && explorerSelectedSection !== 'images') {
    dispatch({type: 'ui/setExplorerSelectedSection', payload: 'images'});
  } else if (nextSelection.type === 'file' && explorerSelectedSection !== 'files') {
    dispatch({type: 'ui/setExplorerSelectedSection', payload: 'files'});
  }

  if (nextSelection.type === 'resource') {
    dispatch({
      type: 'main/selectResource',
      payload: {
        resourceIdentifier: nextSelection.resourceIdentifier,
        isVirtualSelection: true,
      },
    });
  }
  if (nextSelection.type === 'file') {
    dispatch({
      type: 'main/selectFile',
      payload: {filePath: nextSelection.filePath, isVirtualSelection: true},
    });
  }
  if (nextSelection.type === 'image') {
    dispatch({
      type: 'main/selectImage',
      payload: {imageId: nextSelection.imageId, isVirtualSelection: true},
    });
  }

  dispatch({
    type: 'main/setSelectionHistory',
    payload: {newSelectionHistory, nextSelectionHistoryIndex},
  });
};
