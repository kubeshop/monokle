import {FileExplorerTabTooltip, GettingStartedPageTooltip, SettingsTooltip, TerminalPaneTooltip, ValidationTabTooltip} from '@constants/tooltips';

import {useAppSelector} from '@redux/hooks';

import {BottomPaneManager, FileTreePane, GettingStarted, GitPane, SearchPane, ValidationPane} from '@organisms';
import {SettingsOutlined} from '@organisms/PageHeader/HelpMenu.styled';

import {LeftMenuBottomSelectionType, NewLeftMenuSelectionType} from '@monokle-desktop/shared/models';
import {ActivityType, Icon} from '@monokle/components';

import CompareSyncPane from '../CompareSyncPane';
import {SettingsPane} from '../SettingsPane';

export const activities: ActivityType<NewLeftMenuSelectionType>[] = [
  {
    type: 'panel',
    name: 'explorer',
    tooltip: <FileExplorerTabTooltip />,
    icon: () => <Icon name="explorer" />,
    component: <FileTreePane />,
    useBadge: () => undefined,
  },
  {
    type: 'fullscreen',
    name: 'compare',
    tooltip: 'Compare resources',
    icon: () => <Icon name="compare" />,
    component: <CompareSyncPane />,
    useBadge: () => undefined,
  },
  {
    type: 'panel',
    name: 'validation',
    tooltip: <ValidationTabTooltip />,
    icon: () => <Icon name="validation" style={{fontSize: 16}} />,
    component: <ValidationPane />,
    useBadge: () => undefined,
  },
  {
    type: 'panel',
    name: 'git',
    tooltip: 'View Git operations',
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
    component: <SearchPane />,
    useBadge: () => undefined,
  },
  {
    type: 'fullscreen',
    name: 'settings',
    tooltip: <SettingsTooltip />,
    icon: () => <SettingsOutlined />,
    component: <SettingsPane />,
    useBadge: () => undefined,
  },
  {
    type: 'fullscreen',
    name: 'getting-started',
    tooltip: <GettingStartedPageTooltip />,
    icon: () => <Icon name="git-ops" style={{fontSize: 16}} />, // to changeit later
    component: <GettingStarted />,
    useBadge: () => undefined,
  },
];

export const extraActivities: ActivityType<LeftMenuBottomSelectionType>[] = [
  {
    type: 'fullscreen',
    name: 'terminal',
    tooltip: <TerminalPaneTooltip />,
    icon: () => <Icon name="terminal" style={{fontSize: 16}} />,
    component: <BottomPaneManager />,
    useBadge: () => undefined,
  },
];
