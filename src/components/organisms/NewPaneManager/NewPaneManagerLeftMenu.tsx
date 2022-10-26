import {useAppSelector} from '@redux/hooks';

import {ActivityBar} from '@monokle/components';

import {activities} from './activities';

const NewPaneManagerLeftMenu: React.FC = () => {
  const leftMenuSelection = useAppSelector(state => state.ui.leftMenu.selection);

  return <ActivityBar activities={activities} isActive value="explorer" onChange={() => {}} />;
};

export default NewPaneManagerLeftMenu;
