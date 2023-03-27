import {AppSelection, isImageSelection} from '@shared/models/selection';

export function isImageSelected(id: string, selection: AppSelection | undefined) {
  return isImageSelection(selection) && selection.imageId === id;
}

export function isImageHighlighted(resourcesIds: string[], selectedK8sResourceId?: string) {
  if (selectedK8sResourceId && resourcesIds.includes(selectedK8sResourceId)) {
    return true;
  }

  return false;
}
