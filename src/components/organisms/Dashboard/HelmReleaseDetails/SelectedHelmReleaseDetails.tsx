import {useState} from 'react';

import {Tabs as AntTabs, Dropdown, Tooltip, Typography} from 'antd';

import styled from 'styled-components';

import {setSelectedHelmRelease, setSelectedHelmReleaseTab} from '@redux/dashboard';
import {useAppDispatch, useAppSelector} from '@redux/hooks';

import {HelmReleaseTab} from '@shared/models/dashboard';
import {trackEvent} from '@shared/utils';
import {
  getHelmReleaseManifestCommand,
  runCommandInMainThread,
  uninstallHelmReleaseCommand,
  upgradeHelmReleaseCommand,
} from '@shared/utils/commands';

import HelmDryRunDiffModal from './HelmDryRunDiffModal';
import {useHelmReleaseDiffContext} from './HelmReleaseContext';
import HelmClusterResources from './HelmReleaseTabs/HelmClusterResources';
import HelmReleaseHooks from './HelmReleaseTabs/HelmReleaseHooks';
import HelmReleaseManifest from './HelmReleaseTabs/HelmReleaseManifest';
import HelmReleaseNotes from './HelmReleaseTabs/HelmReleaseNotes';
import HelmReleaseValues from './HelmReleaseTabs/HelmReleaseValues';
import HelmRevisionsTable from './HelmReleaseTabs/HelmRevisionsTable';
import UpgradeHelmReleaseModal from './UpgradeHelmReleaseModal';

const tabsItems = [
  {
    key: 'cluster-resources',
    label: <Tooltip title="Cluster Resources">Cluster Resources</Tooltip>,
    children: <HelmClusterResources />,
  },
  {
    key: 'revision-history',
    label: <Tooltip title="Revision History">Revision History</Tooltip>,
    children: <HelmRevisionsTable />,
  },
  {
    key: 'release-values',
    label: <Tooltip title="Release Values">Release Values</Tooltip>,
    children: <HelmReleaseValues />,
  },
  {
    key: 'release-manifest',
    label: <Tooltip title="Release Manifests">Release Manifests</Tooltip>,
    children: <HelmReleaseManifest />,
  },
  {
    key: 'release-hooks',
    label: <Tooltip title="Release Hooks">Release Hooks</Tooltip>,
    children: <HelmReleaseHooks />,
  },
  {
    key: 'release-notes',
    label: <Tooltip title="Release Notes">Release Notes</Tooltip>,
    children: <HelmReleaseNotes />,
  },
];

const SelectedHelmRelease = () => {
  const dispatch = useAppDispatch();
  const release = useAppSelector(state => state.dashboard.helm.selectedHelmRelease!);
  const activeTab = useAppSelector(state => state.dashboard.helm.activeHelmReleaseTab);
  const [commandDryRun, setCommandDryRun] = useHelmReleaseDiffContext();
  const [isSelectHelmReleaseOpen, setIsSelectHelmReleaseOpen] = useState(false);
  const [selectedHelmReleaseRepo, setSelectedHelmReleaseRepo] = useState<string>('');

  const onUpgradeDryRunClickHandler = () => {
    setIsSelectHelmReleaseOpen(true);
    setCommandDryRun({
      open: false,
      leftCommand: getHelmReleaseManifestCommand({release: release.name, namespace: release.namespace}),
      rightCommand: upgradeHelmReleaseCommand({
        release: release.name,
        chart: '',
        namespace: release.namespace,
        dryRun: true,
      }),
      okText: 'Upgrade',
      okHandler: async () => {
        try {
          await runCommandInMainThread(
            upgradeHelmReleaseCommand({
              release: release.name,
              chart: selectedHelmReleaseRepo,
              namespace: release.namespace,
            })
          );
          dispatch(setSelectedHelmRelease({...release}));
          trackEvent('helm_release/upgrade', {dryRun: true, status: 'succeeded'});
        } catch (err) {
          trackEvent('helm_release/upgrade', {dryRun: true, status: 'failed'});
        }
      },
    });
    trackEvent('helm_release/upgrade', {dryRun: true});
  };

  const onUninstallDryRunClickHandler = () => {
    setCommandDryRun({
      open: true,
      leftCommand: getHelmReleaseManifestCommand({release: release.name, namespace: release.namespace}),
      rightCommand: uninstallHelmReleaseCommand({release: release.name, namespace: release.namespace, dryRun: true}),
      okText: 'Uninstall',
      okHandler: async () => {
        try {
          await runCommandInMainThread(
            uninstallHelmReleaseCommand({release: release.name, namespace: release.namespace})
          );
          dispatch(setSelectedHelmRelease(null));
          trackEvent('helm_release/uninstall', {dryRun: true, status: 'succeeded'});
        } catch (err) {
          trackEvent('helm_release/uninstall', {dryRun: true, status: 'failed'});
        }
      },
    });
    trackEvent('helm_release/uninstall', {dryRun: true});
  };

  const onUninstallReleaseClickHandler = async () => {
    try {
      await uninstallHelmReleaseCommand({release: release.name, namespace: release.namespace, dryRun: true});
      trackEvent('helm_release/uninstall', {dryRun: false, status: 'succeeded'});
    } catch (err) {
      trackEvent('helm_release/uninstall', {dryRun: false, status: 'failed'});
    }
  };

  const onUpgradeClickHandler = () => {
    setIsSelectHelmReleaseOpen(true);
    setCommandDryRun(undefined);
  };

  const onSelectHelmRepoOkHandler = async (repo: string) => {
    setSelectedHelmReleaseRepo(repo);
    if (commandDryRun) {
      setCommandDryRun({
        ...commandDryRun,
        open: true,
        rightCommand: upgradeHelmReleaseCommand({
          release: release?.name,
          chart: repo,
          namespace: release?.namespace,
          dryRun: true,
        }),
      });
    } else {
      try {
        await runCommandInMainThread(
          upgradeHelmReleaseCommand({release: release.name, chart: repo, namespace: release.namespace})
        );
        dispatch(setSelectedHelmRelease({...release}));
        trackEvent('helm_release/upgrade', {dryRun: false, status: 'succeeded'});
      } catch (err) {
        trackEvent('helm_release/upgrade', {dryRun: false, status: 'failed'});
      }
    }
  };

  const onDiffDismissHandler = () => {
    setIsSelectHelmReleaseOpen(false);
    setCommandDryRun(undefined);
  };

  return (
    <Container>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24}}>
        <Typography.Title style={{marginBottom: 0}} level={4}>
          {release.name}
        </Typography.Title>
        <div style={{display: 'flex', gap: 16}}>
          <Dropdown.Button
            type="primary"
            menu={{items: [{key: 'upgrade', label: 'Upgrade', onClick: onUpgradeClickHandler}]}}
            onClick={onUpgradeDryRunClickHandler}
          >
            Dry-run Upgrade
          </Dropdown.Button>

          <Dropdown.Button
            type="primary"
            menu={{items: [{key: 'uninstall', label: 'Uninstall', onClick: onUninstallReleaseClickHandler}]}}
            onClick={onUninstallDryRunClickHandler}
          >
            Dry-run Uninstall
          </Dropdown.Button>
        </div>
      </div>

      <div style={{display: 'flex', flexDirection: 'column'}}>
        <Tabs
          items={tabsItems}
          activeKey={activeTab}
          onChange={(tab: HelmReleaseTab) => {
            dispatch(setSelectedHelmReleaseTab(tab));
            trackEvent('helm_release/release_select_tab', {tab});
          }}
        />
      </div>
      <div id="helmDiffModalContainer" />
      {commandDryRun && commandDryRun.open && (
        <HelmDryRunDiffModal
          leftSideCommand={commandDryRun?.leftCommand}
          rightSideCommand={commandDryRun?.rightCommand}
          onClose={onDiffDismissHandler}
          onOk={commandDryRun?.okHandler}
          okText={commandDryRun?.okText}
        />
      )}
      {isSelectHelmReleaseOpen && (
        <UpgradeHelmReleaseModal
          onOk={onSelectHelmRepoOkHandler}
          onClose={() => setIsSelectHelmReleaseOpen(false)}
          isDryRun={Boolean(commandDryRun)}
        />
      )}
    </Container>
  );
};

export default SelectedHelmRelease;

const Container = styled.div`
  padding: 28px;
`;

const Tabs = styled(props => <AntTabs {...props} />)`
  height: calc(100vh - 160px);

  .ant-tabs-nav::before {
    display: none;
  }

  .ant-tabs-content-holder {
    overflow-y: hidden;
    display: flex;
    flex-direction: column;
  }

  &.ant-tabs > .ant-tabs-nav > .ant-tabs-nav-wrap {
  }

  .ant-tabs-content {
    position: unset;
    height: 100%;
  }

  & .ant-tabs-tabpane-active {
    height: 100%;
  }
`;
