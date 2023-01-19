import {useMemo} from 'react';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setLeftBottomMenuSelection, setLeftMenuIsActive, setLeftMenuSelection} from '@redux/reducers/ui';

import {ActivityBar} from '@monokle/components';
import {activeProjectSelector} from '@shared/utils/selectors';

import {activities, extraActivities} from './activities';

const NewPaneManagerLeftMenu: React.FC = () => {
  const dispatch = useAppDispatch();
  const activeProject = useAppSelector(activeProjectSelector);
  const leftActive = useAppSelector(state => state.ui.leftMenu.isActive);
  const leftMenuBottomSelection = useAppSelector(state => state.ui.leftMenu.bottomSelection);
  const leftMenuSelection = useAppSelector(state => state.ui.leftMenu.selection);
  const previewingCluster = useAppSelector(state => state.ui.previewingCluster);

  const isActive = useMemo(
    () => Boolean(activeProject || previewingCluster) && leftActive,
    [activeProject, leftActive, previewingCluster]
  );

  return (
    <ActivityBar
      style={{paddingBottom: 10}}
      activities={activities}
      extraActivities={extraActivities}
      isActive={isActive}
      value={leftMenuSelection}
      extraValue={leftMenuBottomSelection}
      onChange={activityName => {
        if (activityName === leftMenuSelection && leftActive) {
          dispatch(setLeftMenuIsActive(false));
          return;
        }

        if (!leftActive) {
          dispatch(setLeftMenuIsActive(true));
        }

        dispatch(setLeftMenuSelection(activityName));
      }}
      onChangeExtra={activityName => {
        if (leftMenuBottomSelection === activityName) {
          dispatch(setLeftBottomMenuSelection(undefined));
          return;
        }

        dispatch(setLeftBottomMenuSelection(activityName));
      }}
    />
  );
};

export default NewPaneManagerLeftMenu;
