import {useAppSelector} from '@redux/hooks';

import {ActivityBar} from '@monokle/components';

import {activities, extraActivities} from './activities';

const NewPaneManagerLeftMenu: React.FC = () => {
  const leftMenuSelection = useAppSelector(state => state.ui.leftMenu.selection);

  return (
    <ActivityBar
      activities={activities}
      extraActivities={extraActivities}
      isActive
      value="explorer"
      onChange={() => {}}
    />
  );
};

export default NewPaneManagerLeftMenu;
