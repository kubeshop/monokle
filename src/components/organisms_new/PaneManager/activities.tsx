/* eslint-disable react-hooks/rules-of-hooks */
import {SettingOutlined} from '@ant-design/icons';

import {FileExplorerTabTooltip, SettingsTooltip, TerminalPaneTooltip} from '@constants/tooltips';

import {useAppSelector} from '@redux/hooks';

import {BottomPaneManager, DashboardPane, GitPane} from '@organisms';

import {ActivityType, Icon} from '@monokle/components';
import {LeftMenuBottomSelectionType, LeftMenuSelectionType} from '@shared/models/ui';

import CompareSyncPane from '../CompareSyncPane';
import ExplorerPane from '../ExplorerPane';
import SettingsPane from '../SettingsPane';
import ValidationPane from '../ValidationPane';

export const activities: ActivityType<LeftMenuSelectionType>[] = [
  {
    type: 'panel',
    name: 'explorer',
    tooltip: <FileExplorerTabTooltip />,
    icon: () => <Icon name="document" style={{fontSize: '16px', marginTop: 4}} />,
    component: <ExplorerPane />,
    useBadge: () => undefined,
    isVisible: () => useAppSelector(state => Boolean(!state.ui.isInQuickClusterMode)),
  },
  {
    type: 'fullscreen',
    name: 'compare',
    tooltip: 'Compare resources',
    icon: () => <Icon name="compare" />,
    component: <CompareSyncPane />,
    useBadge: () => undefined,
    isVisible: () => useAppSelector(state => Boolean(!state.ui.isInQuickClusterMode)),
  },
  {
    type: 'panel',
    name: 'validation',
    tooltip: 'View validation errors',
    icon: () => <Icon name="validation" style={{fontSize: '16px', marginTop: 4}} />,
    component: <ValidationPane />,
    useBadge: () => undefined,
    isVisible: () => useAppSelector(state => Boolean(!state.ui.isInQuickClusterMode)),
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
    isVisible: () => useAppSelector(state => Boolean(!state.ui.isInQuickClusterMode)),
  },
  {
    type: 'panel',
    name: 'dashboard',
    tooltip: 'View cluster dashboard',
    icon: () => <Icon name="cluster-dashboard" style={{fontSize: '16px', marginTop: 4}} />,
    component: <DashboardPane />,
    useBadge: () => undefined,
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
    isVisible: () => useAppSelector(state => Boolean(!state.ui.isInQuickClusterMode)),
  },
];
