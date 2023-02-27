import {DEFAULT_PANE_CONFIGURATION} from '@constants/constants';

import {useAppSelector} from '@redux/hooks';

import {useMainPaneDimensions} from '@utils/hooks';

export const usePaneHeight = () => {
  const bottomPaneHeight =
    useAppSelector(state => state.ui.paneConfiguration.bottomPaneHeight) || DEFAULT_PANE_CONFIGURATION.bottomPaneHeight;
  const bottomSelection = useAppSelector(state => state.ui.leftMenu.bottomSelection);

  const {height} = useMainPaneDimensions();

  if (bottomSelection) {
    return height - bottomPaneHeight - 1;
  }

  return height;
};
