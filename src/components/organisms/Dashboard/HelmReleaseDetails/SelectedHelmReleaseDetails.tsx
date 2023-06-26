import {useState} from 'react';

import {Tabs as AntTabs, Dropdown, Modal, Tooltip, Typography} from 'antd';

import styled from 'styled-components';

import {setSelectedHelmRelease, setSelectedHelmReleaseTab} from '@redux/dashboard';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';
import {loadClusterHelmReleases} from '@redux/thunks/cluster/loadClusterHelmReleases';

import {errorAlert, successAlert} from '@utils/alert';

import {HelmReleaseTab} from '@shared/models/dashboard';
import {Colors} from '@shared/styles';
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
      okHandler: () => {},
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
        Modal.confirm({
          title: 'Are you sure you want to uninstall this release?',
          content: 'This action cannot be undone.',
          okText: 'Uninstall',
          onOk: async () => {
            try {
              const result = await runCommandInMainThread(
                uninstallHelmReleaseCommand({release: release.name, namespace: release.namespace})
              );
              if (result.stderr) {
                dispatch(setAlert(errorAlert('Uninstall failed', result.stderr)));
                trackEvent('helm_release/uninstall', {dryRun: true, status: 'failed'});
              } else {
                dispatch(setAlert(successAlert("Release's un-installation has been scheduled")));
                dispatch(setSelectedHelmRelease(null));
                dispatch(loadClusterHelmReleases());
                trackEvent('helm_release/uninstall', {dryRun: true, status: 'succeeded'});
              }
            } catch (err: any) {
              dispatch(setAlert(errorAlert('Uninstall failed', err.message)));
              trackEvent('helm_release/uninstall', {dryRun: true, status: 'failed'});
            }
          },
        });
      },
    });
    trackEvent('helm_release/uninstall', {dryRun: true});
  };

  const onUninstallReleaseClickHandler = async () => {
    Modal.confirm({
      title: 'Are you sure you want to uninstall this release?',
      content: 'This action cannot be undone.',
      okText: 'Uninstall',
      onOk: async () => {
        try {
          const result = await runCommandInMainThread(
            uninstallHelmReleaseCommand({release: release.name, namespace: release.namespace})
          );
          if (result.stderr) {
            dispatch(setAlert(errorAlert('Uninstall failed', result.stderr)));
            trackEvent('helm_release/uninstall', {dryRun: false, status: 'failed'});
          } else {
            dispatch(setAlert(successAlert("Release's un-installation has been scheduled")));
            dispatch(setSelectedHelmRelease(null));
            dispatch(loadClusterHelmReleases());
            trackEvent('helm_release/uninstall', {dryRun: false, status: 'succeeded'});
          }
        } catch (err: any) {
          dispatch(setAlert(errorAlert('Uninstall failed', err.message)));
          trackEvent('helm_release/uninstall', {dryRun: false, status: 'failed'});
        }
      },
    });
  };

  const onUpgradeClickHandler = () => {
    setIsSelectHelmReleaseOpen(true);
    setCommandDryRun(undefined);
  };

  const onSelectHelmRepoOkHandler = async (repo: string, version: string) => {
    if (commandDryRun) {
      setCommandDryRun({
        ...commandDryRun,
        open: true,
        rightCommand: upgradeHelmReleaseCommand({
          release: release?.name,
          chart: repo,
          namespace: release?.namespace,
          dryRun: true,
          version,
        }),
        okHandler: async () => {
          Modal.confirm({
            title: 'Are you sure you want to upgrade this release?',
            content: 'This action cannot be undone.',
            okText: 'Upgrade',
            onOk: async () => {
              try {
                const result = await runCommandInMainThread(
                  upgradeHelmReleaseCommand({release: release.name, chart: repo, namespace: release.namespace, version})
                );
                if (result.stderr) {
                  dispatch(setAlert(errorAlert('Upgrade failed', result.stderr)));
                  trackEvent('helm_release/upgrade', {dryRun: true, status: 'failed'});
                } else {
                  dispatch(setAlert(successAlert("Release's upgrade has been scheduled")));
                  dispatch(setSelectedHelmRelease({...release}));
                  trackEvent('helm_release/upgrade', {dryRun: true, status: 'succeeded'});
                }
              } catch (err: any) {
                dispatch(setAlert(errorAlert('Upgrade failed', err.message)));
                trackEvent('helm_release/upgrade', {dryRun: true, status: 'failed'});
              }
            },
          });
        },
      });
    } else {
      Modal.confirm({
        title: 'Are you sure you want to upgrade this release?',
        content: 'This action cannot be undone.',
        okText: 'Upgrade',
        onOk: async () => {
          try {
            const result = await runCommandInMainThread(
              upgradeHelmReleaseCommand({release: release.name, chart: repo, namespace: release.namespace, version})
            );
            if (result.stderr) {
              dispatch(setAlert(errorAlert('Upgrade failed', result.stderr)));
              trackEvent('helm_release/upgrade', {dryRun: false, status: 'failed'});
            } else {
              dispatch(setAlert(successAlert("Release's upgrade has been scheduled")));
              dispatch(setSelectedHelmRelease({...release}));
              trackEvent('helm_release/upgrade', {dryRun: false, status: 'succeeded'});
            }
          } catch (err: any) {
            dispatch(setAlert(errorAlert('Upgrade failed', err.message)));
            trackEvent('helm_release/upgrade', {dryRun: false, status: 'failed'});
          }
        },
      });
    }
  };

  const onDiffDismissHandler = () => {
    setIsSelectHelmReleaseOpen(false);
    setCommandDryRun(undefined);
  };

  return (
    <Container>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24}}>
        <Title>
          {release.name}/{release.chart}
        </Title>

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
  height: 100%;
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

  & .ant-tabs-tab.ant-tabs-tab .ant-tabs-tab-btn {
    color: ${Colors.grey7};
    font-size: 16px;
    font-weight: 600;
    line-height: 24px;
  }

  & .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
    color: ${Colors.grey9};
  }

  & .ant-tabs-ink-bar {
    background-color: ${Colors.grey9};
  }
`;

const Title = styled(Typography.Text)`
  font-size: 24px;
  font-weight: 700;
  line-height: 22px;
  color: ${Colors.grey9};
`;
