import {AppSelection, isImageSelection} from '@shared/models/selection';

export function isImageSelected(id: string, selection: AppSelection | undefined) {
  return isImageSelection(selection) && selection.imageId === id;
}

export function isImageHighlighted(id: string, highlights: AppSelection[] | undefined) {
  return highlights?.some(highlight => isImageSelected(id, highlight)) || false;
}
