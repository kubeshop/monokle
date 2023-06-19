import {useState} from 'react';

import {Tabs as AntTabs, Dropdown, Drawer as RawDrawer} from 'antd';

import styled from 'styled-components';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setSelectedHelmRelease} from '@redux/reducers/ui';

import {Colors} from '@shared/styles';
import {
  getHelmReleaseManifestCommand,
  uninstallHelmReleaseCommand,
  upgradeHelmReleaseCommand,
} from '@shared/utils/commands';

import HelmDryRunDiffModal from './HelmDryRunDiffModal';
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

const HelmReleaseDetails = () => {
  const dispatch = useAppDispatch();
  const release = useAppSelector(state => state.ui.helmPane.selectedHelmRelease!);
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
    setCommandDryRun('upgrade-dry-run');
  };

  const onSelectHelmRepoOkHandler = (repo: string) => {
    setSelectedHelmReleaseRepo(repo);
    if (commandDryRun === 'upgrade-dry-run') {
      setIsHelmDiffModalOpen(true);
    }
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

  const onDismissClickHandler = () => {
    dispatch(setSelectedHelmRelease(null));
  };
  return (
    <>
      <Drawer
        placement="right"
        size="large"
        open={Boolean(release)}
        getContainer={false}
        onClose={onDismissClickHandler}
        title={release.name}
      >
        <div style={{display: 'flex', flexDirection: 'column'}}>
          <Tabs items={tabsItems} />
          <Footer>
            <Dropdown.Button
              type="primary"
              menu={{items: [{key: 'dry-run', label: 'Dry-run', onClick: onUpgradeDryRunClickHandler}]}}
              onClick={onUpgradeClickHandler}
            >
              Upgrade
            </Dropdown.Button>

            <Dropdown.Button
              type="primary"
              menu={{items: [{key: 'dry-run', label: 'Dry-run', onClick: onUninstallDryRunClickHandler}]}}
              onClick={onUninstallDryRunClickHandler}
            >
              Uninstall
            </Dropdown.Button>
          </Footer>
        </div>
      </Drawer>
      <div id="helmDiffModalContainer" />
      {isHelmDiffModalOpen && (
        <HelmDryRunDiffModal
          leftSideCommand={leftSideCommand}
          rightSideCommand={rightSideCommand}
          onClose={() => setIsHelmDiffModalOpen(false)}
        />
      )}
      {isSelectHelmReleaseOpen && (
        <UpgradeHelmReleaseModal onOk={onSelectHelmRepoOkHandler} onClose={() => setIsSelectHelmReleaseOpen(false)} />
      )}
    </>
  );
};

export default HelmReleaseDetails;

export const Drawer = styled(RawDrawer)`
  & .ant-drawer-content-wrapper {
    width: calc(100vw - 34%) !important;
  }
  & .ant-drawer-content {
    background: ${Colors.grey1};
  }
  z-index: 1000;

  & .ant-drawer-close {
    position: absolute;
    right: 0px;
  }

  & .ant-drawer-extra {
    margin-right: 20px;
  }

  & .ant-drawer-header {
    border-bottom: none;
  }

  & .ant-drawer-body {
    overflow: hidden;
    padding: 0;
  }
`;

export const Footer = styled.div`
  height: 75px;

  display: flex;
  gap: 16px;
  border-top: 1px solid ${Colors.grey4};
  padding: 20px 28px;
  margin-top: 12px;
  .ant-space-compact-block {
    width: unset;
  }
`;

export const Tabs = styled(props => <AntTabs {...props} />)`
  height: calc(100vh - 200px);

  .ant-tabs-content-holder {
    overflow-y: hidden;
    display: flex;
    flex-direction: column;
    padding: 0px 28px;
  }

  &.ant-tabs > .ant-tabs-nav > .ant-tabs-nav-wrap {
    padding: 0px 28px !important;
  }

  .ant-tabs-content {
    position: unset;
    margin-bottom: 36px;
  }
`;
