import {useState} from 'react';

import {Button, Dropdown, Modal, Tooltip} from 'antd';

import {setSelectedHelmRelease, setSelectedHelmReleaseTab} from '@redux/dashboard';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';
import {loadClusterHelmReleases} from '@redux/thunks/cluster/loadClusterHelmReleases';

import {errorAlert, successAlert} from '@utils/alert';
import {getHelmReleaseManifestCommand, uninstallHelmReleaseCommand, upgradeHelmReleaseCommand} from '@utils/helm';

import {HelmReleaseTab} from '@shared/models/dashboard';
import {trackEvent} from '@shared/utils';
import {runCommandInMainThread} from '@shared/utils/commands';

import HelmDryRunDiffModal from './HelmDryRunDiffModal';
import {useHelmReleaseDiffContext} from './HelmReleaseContext';
import HelmClusterResources from './HelmReleaseTabs/HelmClusterResources';
import HelmReleaseHooks from './HelmReleaseTabs/HelmReleaseHooks';
import HelmReleaseManifest from './HelmReleaseTabs/HelmReleaseManifest';
import HelmReleaseNotes from './HelmReleaseTabs/HelmReleaseNotes';
import HelmReleaseValues from './HelmReleaseTabs/HelmReleaseValues';
import HelmRevisionsTable from './HelmReleaseTabs/HelmRevisionsTable';
import * as S from './SelectedHelmReleaseDetails.styled';
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
      okText: 'Update',
      okHandler: () => {},
    });
    trackEvent('helm_release/upgrade', {dryRun: true});
  };

  const onUninstallReleaseClickHandler = async () => {
    Modal.confirm({
      title: `Are you sure you want to uninstall ${release.name}?`,
      content: 'This action cannot be undone.',
      okText: 'Uninstall',
      okType: 'danger',
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
            title: `Are you sure you want to update ${release.name} to ${version}`,
            content: 'This action cannot be undone.',
            okText: 'update',
            onOk: async () => {
              try {
                const result = await runCommandInMainThread(
                  upgradeHelmReleaseCommand({release: release.name, chart: repo, namespace: release.namespace, version})
                );
                if (result.stderr) {
                  dispatch(setAlert(errorAlert('Update failed', result.stderr)));
                  trackEvent('helm_release/upgrade', {dryRun: true, status: 'failed'});
                } else {
                  dispatch(setAlert(successAlert("Release's update has been scheduled")));
                  const latestReleases = await dispatch(loadClusterHelmReleases()).unwrap();
                  dispatch(setSelectedHelmRelease(latestReleases.find(r => r.name === release.name) || null));
                  trackEvent('helm_release/upgrade', {dryRun: true, status: 'succeeded'});
                }
              } catch (err: any) {
                dispatch(setAlert(errorAlert('Update failed', err.message)));
                trackEvent('helm_release/upgrade', {dryRun: true, status: 'failed'});
              }
            },
          });
        },
      });
    } else {
      Modal.confirm({
        title: `Are you sure you want to update ${release.name} to ${version}`,
        content: 'This action cannot be undone.',
        okText: 'Update',
        onOk: async () => {
          try {
            const result = await runCommandInMainThread(
              upgradeHelmReleaseCommand({release: release.name, chart: repo, namespace: release.namespace, version})
            );
            if (result.stderr) {
              dispatch(setAlert(errorAlert('update failed', result.stderr)));
              trackEvent('helm_release/upgrade', {dryRun: false, status: 'failed'});
            } else {
              dispatch(setAlert(successAlert("Release's update has been scheduled")));
              const latestReleases = await dispatch(loadClusterHelmReleases()).unwrap();
              dispatch(setSelectedHelmRelease(latestReleases.find(r => r.name === release.name) || null));
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
    <S.Container>
      <S.Header>
        <Tooltip title={`${release.name}/${release.chart}`}>
          <S.Title>
            {release.name}/{release.chart}
          </S.Title>
        </Tooltip>

        <S.ActionsContainer>
          <Tooltip
            title="Shows a diff of the current release manifests and those generated for another version of the chart"
            placement="bottomLeft"
            zIndex={1}
          >
            <Dropdown.Button
              type="primary"
              menu={{items: [{key: 'upgrade', label: 'Update', onClick: onUpgradeClickHandler}]}}
              onClick={onUpgradeDryRunClickHandler}
            >
              Dry-run Update
            </Dropdown.Button>
          </Tooltip>
          <Button type="primary" danger onClick={onUninstallReleaseClickHandler}>
            Uninstall
          </Button>
        </S.ActionsContainer>
      </S.Header>

      <div style={{display: 'flex', flexDirection: 'column'}}>
        <S.Tabs
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
    </S.Container>
  );
};

export default SelectedHelmRelease;
