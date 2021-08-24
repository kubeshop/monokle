import React, {useRef} from 'react';
import {useHotkeys} from 'react-hotkeys-hook';
import hotkeys from '@constants/hotkeys';
import {useSelector} from 'react-redux';

import {ROOT_FILE_ENTRY} from '@constants/constants';

import {useAppDispatch, useAppSelector} from '@redux/hooks';

import {isInPreviewModeSelector} from '@redux/selectors';
import {toggleSettings, toggleLeftMenu, toggleRightMenu} from '@redux/reducers/ui';
import {startPreview, stopPreview} from '@redux/services/preview';
import {setRootFolder} from '@redux/thunks/setRootFolder';

import {selectFromHistory} from '@redux/thunks/selectionHistory';

import {makeOnUploadHandler} from '@utils/fileUpload';

const HotKeysHandler = () => {
  const dispatch = useAppDispatch();
  const mainState = useAppSelector(state => state.main);
  const configState = useAppSelector(state => state.config);
  const isInPreviewMode = useSelector(isInPreviewModeSelector);

  const folderInputRef = useRef<HTMLInputElement>(null);
  const startFileUploader = () => {
    folderInputRef && folderInputRef.current?.click();
  };
  const onUploadHandler = makeOnUploadHandler(folderInputRef, folder => dispatch(setRootFolder(folder)));

  useHotkeys(hotkeys.SELECT_FOLDER, () => {
    startFileUploader();
  });

  useHotkeys(
    hotkeys.REFRESH_FOLDER,
    () => {
      if (mainState.fileMap && mainState.fileMap[ROOT_FILE_ENTRY] && mainState.fileMap[ROOT_FILE_ENTRY].filePath) {
        dispatch(setRootFolder(mainState.fileMap[ROOT_FILE_ENTRY].filePath));
      }
    },
    [mainState]
  );

  useHotkeys(hotkeys.TOGGLE_SETTINGS, () => {
    dispatch(toggleSettings());
  });

  useHotkeys(
    hotkeys.PREVIEW_CLUSTER,
    () => {
      startPreview(configState.kubeconfigPath, 'cluster', dispatch);
    },
    [configState]
  );

  useHotkeys(
    hotkeys.EXIT_PREVIEW_MODE,
    () => {
      if (isInPreviewMode) {
        stopPreview(dispatch);
      }
    },
    [isInPreviewMode]
  );

  useHotkeys(hotkeys.TOGGLE_LEFT_PANE, () => {
    dispatch(toggleLeftMenu());
  });

  useHotkeys(hotkeys.TOGGLE_RIGHT_PANE, () => {
    dispatch(toggleRightMenu());
  });

  useHotkeys(hotkeys.SELECT_FROM_HISTORY_BACK, () => {
    dispatch(selectFromHistory({direction: 'left'}));
  });

  useHotkeys(hotkeys.SELECT_FROM_HISTORY_FORWARD, () => {
    dispatch(selectFromHistory({direction: 'right'}));
  });

  return (
    <>
      <input
        type="file"
        /* @ts-expect-error */
        directory=""
        webkitdirectory=""
        onChange={onUploadHandler}
        ref={folderInputRef}
        style={{display: 'none'}}
      />
    </>
  );
};

export default HotKeysHandler;
