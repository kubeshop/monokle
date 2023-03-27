import {AppSelection, isImageSelection} from '@shared/models/selection';

export function isImageSelected(id: string, selection: AppSelection | undefined) {
  return isImageSelection(selection) && selection.imageId === id;
}
