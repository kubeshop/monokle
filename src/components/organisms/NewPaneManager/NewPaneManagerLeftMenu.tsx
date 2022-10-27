import {useMemo} from 'react';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setLeftMenuSelection} from '@redux/reducers/ui';
import {activeProjectSelector} from '@redux/selectors';

import {ActivityBar} from '@monokle/components';

import {activities, extraActivities} from './activities';

const NewPaneManagerLeftMenu: React.FC = () => {
  const dispatch = useAppDispatch();
  const activeProject = useAppSelector(activeProjectSelector);
  const leftActive = useAppSelector(state => state.ui.leftMenu.isActive);
  const leftMenuSelection = useAppSelector(state => state.ui.leftMenu.selection);

  const isActive = useMemo(() => Boolean(activeProject) && leftActive, [activeProject, leftActive]);

  return (
    <ActivityBar
      activities={activities}
      extraActivities={extraActivities}
      isActive={isActive}
      value={leftMenuSelection}
      onChange={activityName => {
        dispatch(setLeftMenuSelection(activityName));
      }}
    />
  );
};

export default NewPaneManagerLeftMenu;
