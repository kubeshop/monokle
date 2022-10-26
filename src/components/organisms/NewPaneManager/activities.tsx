import {NewLeftMenuSelectionType} from '@models/ui';

import {ActivityType, Icon} from '@monokle/components';

export const activities: ActivityType<NewLeftMenuSelectionType>[] = [
  {
    type: 'panel',
    name: 'explorer',
    tooltip: 'File Explorer',
    icon: () => <Icon name="helm" style={{fontSize: 16}} />,
    component: <div>File Pane</div>,
    useBadge: () => undefined,
  },
];
