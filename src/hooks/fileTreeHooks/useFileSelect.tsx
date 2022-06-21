import {useSelector} from 'react-redux';

import micromatch from 'micromatch';
import path from 'path';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectFile, setSelectingFile} from '@redux/reducers/main';
import {fileIncludesSelector, isInPreviewModeSelector, scanExcludesSelector} from '@redux/selectors';
import {stopPreview} from '@redux/services/preview';

export const useFileSelect = () => {
  const fileIncludes = useAppSelector(fileIncludesSelector);
  const scanExcludes = useAppSelector(scanExcludesSelector);
  const isInPreviewMode = useSelector(isInPreviewModeSelector);
  const dispatch = useAppDispatch();

  return function onSelect(selectedKeysValue: React.Key[], info: any) {
    const nodeKey = info.node.parentKey || info.node.key;

    if (!fileIncludes.some(fileInclude => micromatch.isMatch(path.basename(nodeKey), fileInclude))) {
      return;
    }
    if (scanExcludes.some(scanExclude => micromatch.isMatch(path.basename(nodeKey), scanExclude))) {
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
};
