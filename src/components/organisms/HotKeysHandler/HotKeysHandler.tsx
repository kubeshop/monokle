import React, {useRef} from 'react';
import {useHotkeys} from 'react-hotkeys-hook';
import hotkeys from '@constants/hotkeys';
import {useSelector} from 'react-redux';

import {ROOT_FILE_ENTRY} from '@src/constants';

import {useAppDispatch, useAppSelector} from '@redux/hooks';

import {inPreviewMode} from '@redux/selectors';
import {toggleSettings} from '@redux/reducers/ui';
import {startPreview, stopPreview} from '@redux/services/preview';
import {setRootFolder} from '@redux/thunks/setRootFolder';

import {makeOnUploadHandler} from '@utils/fileUpload';

const HotKeysHandler = (props: {onToggleLeftMenu: () => void; onToggleRightMenu: () => void}) => {
  const {onToggleLeftMenu, onToggleRightMenu} = props;
  const dispatch = useAppDispatch();
  const mainState = useAppSelector(state => state.main);
  const configState = useAppSelector(state => state.config);
  const isInPreviewMode = useSelector(inPreviewMode);

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
      startPreview(configState.kubeconfig, 'cluster', dispatch);
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

  useHotkeys(
    hotkeys.TOGGLE_LEFT_PANE,
    () => {
      onToggleLeftMenu();
    },
    [onToggleLeftMenu]
  );

  useHotkeys(
    hotkeys.TOGGLE_RIGHT_PANE,
    () => {
      onToggleRightMenu();
    },
    [onToggleRightMenu]
  );

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
