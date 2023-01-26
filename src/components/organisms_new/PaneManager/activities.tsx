/* eslint-disable react-hooks/rules-of-hooks */
import {SettingOutlined} from '@ant-design/icons';

import {FileExplorerTabTooltip, SettingsTooltip, TerminalPaneTooltip} from '@constants/tooltips';

import {useAppSelector} from '@redux/hooks';
import {isInClusterModeSelector} from '@redux/selectors';

import {BottomPaneManager, DashboardPane, FileTreePane, GitPane} from '@organisms';

import {ActivityType, Icon} from '@monokle/components';
import {LeftMenuBottomSelectionType, NewLeftMenuSelectionType} from '@shared/models/ui';

import CompareSyncPane from '../CompareSyncPane';
import SettingsPane from '../SettingsPane';

export const activities: ActivityType<NewLeftMenuSelectionType>[] = [
  {
    type: 'panel',
    name: 'explorer',
    tooltip: <FileExplorerTabTooltip />,
    icon: () => <Icon name="explorer" />,
    component: <FileTreePane />,
    useBadge: () => undefined,
    isVisible: () => useAppSelector(isInClusterModeSelector),
  },
  {
    type: 'panel',
    name: 'dashboard',
    tooltip: 'View cluster dashboard',
    icon: () => <Icon name="cluster-dashboard" style={{fontSize: '16px', marginTop: '4px'}} />,
    component: <DashboardPane />,
    useBadge: () => undefined,
  },
  {
    type: 'fullscreen',
    name: 'compare',
    tooltip: 'Compare resources',
    icon: () => <Icon name="compare" />,
    component: <CompareSyncPane />,
    useBadge: () => undefined,
    isVisible: () => useAppSelector(isInClusterModeSelector),
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
    isVisible: () => useAppSelector(isInClusterModeSelector),
  },
  {
    type: 'fullscreen',
    name: 'settings',
    tooltip: <SettingsTooltip />,
    icon: () => <SettingOutlined />,
    component: <SettingsPane />,
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
    isVisible: () => useAppSelector(isInClusterModeSelector),
  },
];
