import {useSelector} from 'react-redux';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectFile, setSelectingFile} from '@redux/reducers/main';
import {isInPreviewModeSelector, supportedExtensionsSelector} from '@redux/selectors';
import {stopPreview} from '@redux/services/preview';

export const useFileSelect = () => {
  const supportedExtensions = useAppSelector(supportedExtensionsSelector);
  const isInPreviewMode = useSelector(isInPreviewModeSelector);
  const dispatch = useAppDispatch();

  const onFileSelect = (selectedKeysValue: React.Key[], info: any) => {
    const nodeKey = info.node.parentKey || info.node.key;
    const {isExcluded, isSupported, extension} = info.node;
    if (
      (isExcluded || !isSupported) &&
      !supportedExtensions.some(supportedExtension => supportedExtension === extension)
    ) {
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
