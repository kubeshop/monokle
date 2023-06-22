import {useState} from 'react';

import {Tabs as AntTabs, Dropdown, Typography} from 'antd';

import styled from 'styled-components';

import {setSelectedHelmRelease} from '@redux/dashboard';
import {useAppDispatch, useAppSelector} from '@redux/hooks';

import {
  getHelmReleaseManifestCommand,
  runCommandInMainThread,
  uninstallHelmReleaseCommand,
  upgradeHelmReleaseCommand,
} from '@shared/utils/commands';

import HelmDryRunDiffModal from './HelmDryRunDiffModal';
import {HelmReleaseProvider} from './HelmReleaseContext';
import HelmReleaseManifest from './HelmReleaseTabs/HelmReleaseManifest';
import HelmReleaseNotes from './HelmReleaseTabs/HelmReleaseNotes';
import HelmReleaseValues from './HelmReleaseTabs/HelmReleaseValues';
import HelmRevisionsTable from './HelmReleaseTabs/HelmRevisionsTable';
import UpgradeHelmReleaseModal from './UpgradeHelmReleaseModal';

const tabsItems = [
  {
    key: 'revision-history',
    label: 'Revision History',
    children: <HelmRevisionsTable />,
  },
  {
    key: 'release-values',
    label: 'Release Values',
    children: <HelmReleaseValues />,
  },
  {
    key: 'release-manifest',
    label: 'Release Manifest',
    children: <HelmReleaseManifest />,
  },
  {
    key: 'release-notes',
    label: 'Release Notes',
    children: <HelmReleaseNotes />,
  },
];

const SelectedHelmRelease = () => {
  const dispatch = useAppDispatch();
  const release = useAppSelector(state => state.dashboard.helm.selectedHelmRelease!);
  const [commandDryRun, setCommandDryRun] = useState<'upgrade-dry-run' | 'uninstall-dry-run' | undefined>();
  const [isHelmDiffModalOpen, setIsHelmDiffModalOpen] = useState(false);
  const [isSelectHelmReleaseOpen, setIsSelectHelmReleaseOpen] = useState(false);
  const [selectedHelmReleaseRepo, setSelectedHelmReleaseRepo] = useState<string>('');
  const onUpgradeDryRunClickHandler = () => {
    setIsSelectHelmReleaseOpen(true);
    setCommandDryRun('upgrade-dry-run');
  };

  const onUninstallDryRunClickHandler = () => {
    setIsHelmDiffModalOpen(true);
    setCommandDryRun('uninstall-dry-run');
  };

  const onUpgradeClickHandler = () => {
    setIsSelectHelmReleaseOpen(true);
    setCommandDryRun(undefined);
  };

  const onSelectHelmRepoOkHandler = async (repo: string) => {
    setSelectedHelmReleaseRepo(repo);
    if (commandDryRun === 'upgrade-dry-run') {
      setIsHelmDiffModalOpen(true);
    } else {
      await runCommandInMainThread(
        upgradeHelmReleaseCommand({release: release.name, chart: repo, namespace: release.namespace})
      );
      dispatch(setSelectedHelmRelease({...release}));
    }
  };

  const onDryRunDiffOkHandler = () => {
    setIsHelmDiffModalOpen(false);
    setIsSelectHelmReleaseOpen(false);
  };

  const leftSideCommand = getHelmReleaseManifestCommand({release: release.name, namespace: release.namespace});

  const rightSideCommand =
    commandDryRun === 'upgrade-dry-run'
      ? upgradeHelmReleaseCommand({
          release: release?.name,
          chart: selectedHelmReleaseRepo,
          namespace: release?.namespace,
          dryRun: true,
        })
      : uninstallHelmReleaseCommand({release: release.name, namespace: release.namespace, dryRun: true});

  return (
    <HelmReleaseProvider>
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
              menu={{items: [{key: 'uninstall', label: 'Uninstall', onClick: onUninstallDryRunClickHandler}]}}
              onClick={onUninstallDryRunClickHandler}
            >
              Dry-run Uninstall
            </Dropdown.Button>
          </div>
        </div>

        <div style={{display: 'flex', flexDirection: 'column'}}>
          <Tabs items={tabsItems} />
        </div>
        <div id="helmDiffModalContainer" />
        {isHelmDiffModalOpen && (
          <HelmDryRunDiffModal
            leftSideCommand={leftSideCommand}
            rightSideCommand={rightSideCommand}
            onClose={() => setIsHelmDiffModalOpen(false)}
            onOk={onDryRunDiffOkHandler}
            okText={commandDryRun === 'upgrade-dry-run' ? 'Upgrade' : 'Uninstall'}
          />
        )}
        {isSelectHelmReleaseOpen && (
          <UpgradeHelmReleaseModal
            onOk={onSelectHelmRepoOkHandler}
            onClose={() => setIsSelectHelmReleaseOpen(false)}
            isDryRun={commandDryRun === 'upgrade-dry-run'}
          />
        )}
      </Container>
    </HelmReleaseProvider>
  );
};

export default SelectedHelmRelease;

const Container = styled.div`
  padding: 28px;
`;

const Tabs = styled(props => <AntTabs {...props} />)`
  height: calc(100vh - 200px);

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
  }
`;
