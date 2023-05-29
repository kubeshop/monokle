import {useSelector} from 'react-redux';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectFile} from '@redux/reducers/main';
import {stopPreview} from '@redux/thunks/preview';

import {isInPreviewModeSelector} from '@shared/utils/selectors';

export const useFileSelect = () => {
  const isInPreviewMode = useSelector(isInPreviewModeSelector);
  const dispatch = useAppDispatch();
  const fileOrFolderContainedInFilter = useAppSelector(state => state.main.resourceFilter.fileOrFolderContainedIn);

  const onFileSelect = (selectedKeysValue: React.Key[], info: any) => {
    const nodeKey = info.node.parentKey || info.node.key;
    const {isExcluded, isFolder, isSupported, isTextExtension, isLine} = info.node;

    if (isFolder) {
      return;
    }

    if (!nodeKey.startsWith(fileOrFolderContainedInFilter || '')) {
      return;
    }

    if (!isLine && (isExcluded || !isSupported) && !isTextExtension) {
      return;
    }

    if (nodeKey) {
      // TODO: should the cluster be stopped when a file is selected?
      if (isInPreviewMode) {
        dispatch(stopPreview());
      }
      dispatch(selectFile({filePath: nodeKey}));
    }
  };

  return {onFileSelect};
};
