import {FileExplorerTabTooltip, SettingsTooltip, TerminalPaneTooltip, ValidationTabTooltip} from '@constants/tooltips';

import {NewLeftMenuBottomSelectionType, NewLeftMenuSelectionType} from '@models/ui';

import {useAppSelector} from '@redux/hooks';

import {GitPane} from '@organisms';

import {ActivityType, Icon} from '@monokle/components';

import {SettingsOutlined} from '../PageHeader/HelpMenu.styled';

export const activities: ActivityType<NewLeftMenuSelectionType>[] = [
  {
    type: 'panel',
    name: 'explorer',
    tooltip: <FileExplorerTabTooltip />,
    icon: () => <Icon name="explorer" />,
    component: <div />,
    useBadge: () => undefined,
  },
  {
    type: 'fullscreen',
    name: 'compare',
    tooltip: 'Compare resources',
    icon: () => <Icon name="compare" />,
    component: <div />,
    useBadge: () => undefined,
  },
  {
    type: 'fullscreen',
    name: 'validation',
    tooltip: <ValidationTabTooltip />,
    icon: () => <Icon name="validation" style={{fontSize: 16}} />,
    component: <div />,
    useBadge: () => undefined,
  },
  {
    type: 'panel',
    name: 'git',
    tooltip: <ValidationTabTooltip />,
    icon: () => <Icon name="git-ops" style={{fontSize: 16, marginTop: 4}} />,
    component: <GitPane />,
    useBadge: () => {
      const changedFiles = useAppSelector(state => state.git.changedFiles);

      return {count: changedFiles.length, size: 'small'};
    },
  },
  {
    type: 'panel',
    name: 'search',
    tooltip: 'Advanced Search',
    icon: () => <Icon name="search" style={{fontSize: 16}} />,
    component: <div />,
    useBadge: () => undefined,
  },
  {
    type: 'fullscreen',
    name: 'settings',
    tooltip: <SettingsTooltip />,
    icon: () => <SettingsOutlined />,
    component: <div />,
    useBadge: () => undefined,
  },
];

export const extraActivities: ActivityType<NewLeftMenuBottomSelectionType>[] = [
  {
    type: 'fullscreen',
    name: 'terminal',
    tooltip: <TerminalPaneTooltip />,
    icon: () => <Icon name="terminal" style={{fontSize: 16}} />,
    component: <div />,
    useBadge: () => undefined,
  },
];
