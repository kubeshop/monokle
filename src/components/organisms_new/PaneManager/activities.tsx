import {FileExplorerTabTooltip, SettingsTooltip, TerminalPaneTooltip, ValidationTabTooltip} from '@constants/tooltips';

import {useAppSelector} from '@redux/hooks';

import {
  AuditPane,
  BottomPaneManager,
  DashboardPane,
  FileTreePane,
  GitPane,
  SearchPane,
  ValidationPane,
} from '@organisms';
import {SettingsOutlined} from '@organisms/PageHeader/HelpMenu.styled';

import {ActivityType, Icon} from '@monokle/components';
import {LeftMenuBottomSelectionType, NewLeftMenuSelectionType} from '@shared/models/ui';

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
    type: 'panel',
    name: 'dashboard',
    tooltip: 'View cluster dashboard',
    icon: () => <Icon name="search" style={{fontSize: 16}} />,
    component: <DashboardPane />,
    useBadge: () => undefined,
  },
  {
    type: 'panel',
    name: 'audit',
    tooltip: 'View audit panel',
    icon: () => <Icon name="validation" style={{fontSize: 16}} />,
    component: <AuditPane />,
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
