import {useSelector} from 'react-redux';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectFile, setSelectingFile} from '@redux/reducers/main';
import {isInPreviewModeSelector} from '@redux/selectors';
import {stopPreview} from '@redux/services/preview';

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
      if (isInPreviewMode) {
        stopPreview(dispatch);
      }
      dispatch(setSelectingFile(true));
      dispatch(selectFile({filePath: nodeKey}));
    }
  };

  return {onFileSelect};
};
