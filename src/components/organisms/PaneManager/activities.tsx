/* eslint-disable react-hooks/rules-of-hooks */
import {CloseOutlined, SettingOutlined} from '@ant-design/icons';

import {size} from 'lodash';

import {FileExplorerTabTooltip, SettingsTooltip, TerminalPaneTooltip} from '@constants/tooltips';

import {activeProjectSelector} from '@redux/appConfig';
import {useAppSelector} from '@redux/hooks';
import {problemsSelector, useValidationSelector} from '@redux/validation/validation.selectors';

import {BottomPaneManager, DashboardPane, GitPane} from '@organisms';

import {ActivityType, Icon} from '@monokle/components';
import {LeftMenuBottomSelectionType, LeftMenuSelectionType} from '@shared/models/ui';
import {isInClusterModeSelector} from '@shared/utils/selectors';

import CompareSyncPane from '../CompareSyncPane';
import ExplorerPane from '../ExplorerPane';
import HelmRepoPane from '../HelmRepoPane';
import SettingsPane from '../SettingsPane';
import ValidationPane from '../ValidationPane';

export const activities: ActivityType<LeftMenuSelectionType>[] = [
  {
    type: 'panel',
    name: 'explorer',
    tooltip: <FileExplorerTabTooltip />,
    icon: () => <Icon name="document" style={{fontSize: '18px', marginTop: 4}} />,
    component: <ExplorerPane />,
    useBadge: () => undefined,
    isVisible: () =>
      Boolean(useAppSelector(activeProjectSelector)) && Boolean(useAppSelector(isInClusterModeSelector)) === false,
  },
  {
    type: 'fullscreen',
    name: 'compare',
    tooltip: 'Compare resources',
    icon: () => <Icon name="compare" style={{fontSize: '16px', marginTop: 4}} />,
    component: <CompareSyncPane />,
    useBadge: () => undefined,
    isVisible: () =>
      Boolean(useAppSelector(activeProjectSelector)) && Boolean(useAppSelector(isInClusterModeSelector)) === false,
  },
  {
    type: 'panel',
    name: 'validation',
    tooltip: 'View validation errors',
    icon: () => <Icon name="validation" style={{fontSize: '18px'}} />,
    component: <ValidationPane />,
    useBadge: () => {
      const problemsCount = useValidationSelector(state => size(problemsSelector(state)));
      return {count: problemsCount, size: 'small'};
    },
    isVisible: () =>
      Boolean(useAppSelector(activeProjectSelector)) && Boolean(useAppSelector(isInClusterModeSelector)) === false,
  },
  {
    type: 'fullscreen',
    name: 'helm',
    tooltip: 'Helm',
    icon: () => <Icon name="helm" style={{fontSize: '18px', marginTop: 4}} />,
    component: <HelmRepoPane />,
    useBadge: () => undefined,
    isVisible: () => Boolean(useAppSelector(isInClusterModeSelector)) === false,
  },
  {
    type: 'panel',
    name: 'git',
    tooltip: 'View Git operations',
    icon: () => {
      const changedFiles = useAppSelector(state => state.git.changedFiles);

      return <Icon name="git-ops" style={{fontSize: '18px', marginTop: changedFiles.length ? '0px' : '4px'}} />;
    },
    component: <GitPane />,
    useBadge: () => {
      const changedFiles = useAppSelector(state => state.git.changedFiles);

      return {count: changedFiles.length, size: 'small'};
    },
    isVisible: () => Boolean(useAppSelector(activeProjectSelector)) && !useAppSelector(isInClusterModeSelector),
  },
  {
    type: 'panel',
    name: 'dashboard',
    tooltip: 'View cluster dashboard',
    icon: () => <Icon name="cluster-dashboard" style={{fontSize: '18px', marginTop: 4}} />,
    component: <DashboardPane />,
    useBadge: () => undefined,
  },
  {
    type: 'panel',
    name: 'cluster-validation',
    tooltip: 'View validation errors',
    icon: () => <Icon name="cluster-validation" style={{fontSize: '18px'}} />,
    component: <ValidationPane />,
    useBadge: () => {
      const problemsCount = useValidationSelector(state => size(problemsSelector(state)));
      return {count: problemsCount, size: 'small'};
    },
    isVisible: () => Boolean(useAppSelector(isInClusterModeSelector)),
  },
  {
    type: 'fullscreen',
    name: 'helm-in-cluster',
    tooltip: 'View helm browser',
    icon: () => <Icon name="cluster-helm" style={{fontSize: '18px', marginTop: 4}} />,
    component: <HelmRepoPane />,
    useBadge: () => undefined,
    isVisible: () => Boolean(useAppSelector(isInClusterModeSelector)),
  },
  {
    type: 'fullscreen',
    name: 'settings',
    tooltip: <SettingsTooltip />,
    icon: () => {
      const isClusterConnected = useAppSelector(isInClusterModeSelector);

      return isClusterConnected ? (
        <Icon name="cluster-settings" style={{fontSize: '18px', marginTop: 4}} />
      ) : (
        <SettingOutlined style={{fontSize: '16px', marginTop: 4}} />
      );
    },
    component: <SettingsPane />,
    useBadge: () => undefined,
  },
  {
    type: 'fullscreen',
    name: 'close',
    tooltip: 'Close',
    icon: () => <CloseOutlined style={{fontSize: '16px', marginTop: 4}} />,
    component: <></>,
    useBadge: () => undefined,
    isVisible: () => useAppSelector(isInClusterModeSelector),
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
    isVisible: () => Boolean(useAppSelector(activeProjectSelector)),
  },
];
