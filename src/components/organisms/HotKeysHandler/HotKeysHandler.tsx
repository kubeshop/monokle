import {useHotkeys} from 'react-hotkeys-hook';
import hotkeys from '@constants/hotkeys';
import {useSelector} from 'react-redux';

import {useAppDispatch, useAppSelector} from '@redux/hooks';

import {inPreviewMode} from '@redux/selectors';
import {toggleSettings} from '@redux/reducers/ui';
import {startPreview, stopPreview} from '@redux/services/preview';

const HotKeysHandler = (props: {onToggleLeftMenu: () => void}) => {
  const {onToggleLeftMenu} = props;
  const dispatch = useAppDispatch();
  const mainState = useAppSelector(state => state.main);
  const configState = useAppSelector(state => state.config);
  const isInPreviewMode = useSelector(inPreviewMode);

  useHotkeys(hotkeys.TOGGLE_SETTINGS, () => {
    dispatch(toggleSettings());
  });

  useHotkeys(hotkeys.PREVIEW_CLUSTER, () => {
    startPreview(configState.kubeconfig, 'cluster', dispatch);
  });

  useHotkeys(hotkeys.EXIT_PREVIEW_MODE, () => {
    if (isInPreviewMode) {
      stopPreview(dispatch);
    }
  });

  useHotkeys(hotkeys.TOGGLE_LEFT_PANE, () => {
    onToggleLeftMenu();
  });

  return null;
};

export default HotKeysHandler;
