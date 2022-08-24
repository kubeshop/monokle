import {useSelector} from 'react-redux';

import {useAppDispatch} from '@redux/hooks';
import {selectFile, setSelectingFile} from '@redux/reducers/main';
import {isInPreviewModeSelector} from '@redux/selectors';
import {stopPreview} from '@redux/services/preview';

export const useFileSelect = () => {
  const isInPreviewMode = useSelector(isInPreviewModeSelector);
  const dispatch = useAppDispatch();

  const onFileSelect = (selectedKeysValue: React.Key[], info: any) => {
    const nodeKey = info.node.parentKey || info.node.key;
    const {isExcluded, isSupported, isTextExtension, isLine} = info.node;
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
