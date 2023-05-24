import {useCallback, useState} from 'react';
import ReactMarkdown from 'react-markdown';

import {Dropdown, Skeleton, Typography} from 'antd';
import {CloudDownloadOutlined, DownOutlined} from '@ant-design/icons';
import {useAppDispatch} from '@redux/hooks';

import styled from 'styled-components';
import {Icon} from '@monokle/components';

import {installHelmRepoChart} from '@redux/thunks/InstallHelmRepoChart';
import {useGetHelmChartInfo} from '@hooks/useGetHelmChartInfo';
import helmPlaceholder from '@assets/helm-default-ico.svg';
import {Colors} from '@shared/styles';
import {openUrlInExternalBrowser} from '@shared/utils';

import {HelmChartModalConfirmWithNamespaceSelect} from '@components/molecules';
import PullHelmChartModal from '../PullHelmChartModal';

interface IProps {
  chartName: string;
}

const HelmInfo = ({chartName}: IProps) => {
  const dispatch = useAppDispatch();
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [installModalOpen, setInstallModalOpen] = useState(false);
  const [chartVersion, setChartVersion] = useState('');

  const {value: helmChartInfo, loading: loadingHelmInfo} = useGetHelmChartInfo(chartName);

  const onClickApplyHelmChart = useCallback(
    async (namespace?: string) => {
      const repoName = chartName.split('/')[0];
      await dispatch(
        installHelmRepoChart({name: repoName, chart: chartName, namespace, version: chartVersion})
      ).unwrap();
      setInstallModalOpen(false);
    },
    [chartName, chartVersion, dispatch]
  );

  const items = helmChartInfo?.available_versions.map((i: any) => ({
    label: i.version,
    key: i.version,
  }));

  const latestVersion = helmChartInfo?.version || '';

  const onDownloadLatestHelmChartHandler = () => {
    setChartVersion(latestVersion);
    setConfirmModalOpen(true);
  };

  const onInstallLatestHelmChartHandler = () => {
    setChartVersion(latestVersion);
    setInstallModalOpen(true);
  };

  return loadingHelmInfo ? (
    <Skeleton active={loadingHelmInfo} />
  ) : (
    <Container>
      <Content>
        <div>
          <Header>
            <Logo
              width="100"
              height="100"
              loading="lazy"
              decoding="async"
              src={getHelmRepoLogo(helmChartInfo?.logo_image_id)}
            />
            <ChartInfo>
              <Label>
                Author<Typography.Text> {helmChartInfo?.repository?.name}</Typography.Text>
              </Label>
              <Label>
                Repository<Typography.Link> {helmChartInfo?.repository?.url}</Typography.Link>
              </Label>
              <Label>
                apiVersion<Typography.Text> {helmChartInfo?.data?.apiVersion}</Typography.Text>
              </Label>
              <Label>
                appVersion
                <Typography.Text> {helmChartInfo?.app_version}</Typography.Text>
              </Label>
            </ChartInfo>
          </Header>
        </div>

        <ReactMarkdown
          components={{
            a({href, children, ...restProps}) {
              return (
                <a onClick={() => openUrlInExternalBrowser(href)} {...restProps}>
                  {children}
                </a>
              );
            },
          }}
        >
          {helmChartInfo?.readme || ''}
        </ReactMarkdown>
      </Content>

      <Footer>
        <MenuDropdownList id="versions" style={{height: 300, position: 'absolute'}} />
        <Dropdown.Button
          menu={{
            items,
            onClick: ({key}) => {
              setChartVersion(key);
              setConfirmModalOpen(true);
            },
          }}
          size="large"
          type="primary"
          icon={<DownOutlined />}
          onClick={onDownloadLatestHelmChartHandler}
          getPopupContainer={() => document.getElementById('versions')!}
        >
          <CloudDownloadOutlined />
          Download locally ({latestVersion})
        </Dropdown.Button>
        <Dropdown.Button
          menu={{
            items,
            onClick: ({key}) => {
              setChartVersion(key);
              setInstallModalOpen(true);
            },
          }}
          size="large"
          type="primary"
          icon={<DownOutlined />}
          onClick={onInstallLatestHelmChartHandler}
          getPopupContainer={() => document.getElementById('versions')!}
        >
          <Icon name="cluster-dashboard" />
          Install in cluster ({latestVersion})
        </Dropdown.Button>
      </Footer>

      <PullHelmChartModal
        open={confirmModalOpen}
        dismissModal={() => setConfirmModalOpen(false)}
        chartName={chartName}
        chartVersion={chartVersion}
      />

      <HelmChartModalConfirmWithNamespaceSelect
        isVisible={installModalOpen}
        title="Install Helm Chart"
        onCancel={() => setInstallModalOpen(false)}
        onOk={selectedNamespace => onClickApplyHelmChart(selectedNamespace)}
      />
    </Container>
  );
};

export default HelmInfo;

const getHelmRepoLogo = (logoImageId?: string) => {
  if (logoImageId) {
    return `https://artifacthub.io/image/${logoImageId}`;
  }
  return helmPlaceholder;
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  gap: 20px;
`;

const Logo = styled.img`
  width: 100px;
  height: 100px;
  object-fit: contain;
  object-position: center;
`;

const Label = styled(Typography.Text)`
  color: ${Colors.grey8};
`;

const ChartInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const Content = styled.div`
  overflow: auto;
  min-height: 0;
  max-height: calc(100vh - 292px);
`;

const Footer = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 75px;

  display: flex;
  gap: 16px;
  border-top: 1px solid ${Colors.grey4};
  padding: 20px 28px;

  .ant-space-compact-block {
    width: unset;
  }
`;

const MenuDropdownList = styled.div`
  position: relative;

  ul {
    overflow: overlay;
    height: 200px;
  }

  ul::-webkit-scrollbar {
    width: 8px;
    background-color: transparent;
    transition: 0.3s;
  }

  ul::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
  }

  .ant-dropdown-menu {
    background-color: ${Colors.grey1};
    overflow-x: hidden;
    box-shadow: none;
  }
  .ant-dropdown-menu-item {
    height: 24px;
  }

  .ant-dropdown-menu-item:hover {
    background-color: ${Colors.grey2};
  }
`;
