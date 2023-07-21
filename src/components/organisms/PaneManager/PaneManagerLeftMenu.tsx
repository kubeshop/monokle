import {useMemo} from 'react';

import {activeProjectSelector} from '@redux/appConfig';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setLeftBottomMenuSelection, setLeftMenuIsActive, setLeftMenuSelection} from '@redux/reducers/ui';
import {stopClusterConnection} from '@redux/thunks/cluster';

import {ActivityBar} from '@monokle/components';
import {Colors} from '@shared/styles';
import {trackEvent} from '@shared/utils/telemetry';

import {activities, extraActivities} from './activities';

const PaneManagerLeftMenu: React.FC = () => {
  const dispatch = useAppDispatch();
  const activeProject = useAppSelector(activeProjectSelector);
  const leftActive = useAppSelector(state => state.ui.leftMenu.isActive);
  const leftMenuBottomSelection = useAppSelector(state => state.ui.leftMenu.bottomSelection);
  const leftMenuSelection = useAppSelector(state => state.ui.leftMenu.selection);
  const isInQuickClusterMode = useAppSelector(state => state.ui.isInQuickClusterMode);

  const isActive = useMemo(
    () => Boolean(activeProject || isInQuickClusterMode) && Boolean(leftMenuSelection),
    [activeProject, isInQuickClusterMode, leftMenuSelection]
  );

  return (
    <ActivityBar
      style={{backgroundColor: isActive ? Colors.black100 : Colors.grey10}}
      activities={activities}
      extraActivities={extraActivities}
      isActive={isActive}
      value={leftMenuSelection}
      extraValue={leftMenuBottomSelection}
      onChange={activityName => {
        if (!leftActive && activityName === leftMenuSelection && leftMenuSelection === 'explorer') {
          dispatch(setLeftMenuIsActive(true));
        }

        if (activityName === leftMenuSelection) {
          return;
        }

        if (activityName === 'close') {
          dispatch(stopClusterConnection());
          dispatch(setLeftMenuSelection('dashboard'));
        }

        dispatch(setLeftMenuSelection(activityName));
        trackEvent('left-menu/activity-changed', {activity: activityName});
      }}
      onChangeExtra={activityName => {
        if (leftMenuBottomSelection === activityName) {
          dispatch(setLeftBottomMenuSelection(undefined));
          return;
        }

        dispatch(setLeftBottomMenuSelection(activityName));
        trackEvent('bottom-left-menu/select-option', {option: activityName});
      }}
    />
  );
};

export default PaneManagerLeftMenu;
