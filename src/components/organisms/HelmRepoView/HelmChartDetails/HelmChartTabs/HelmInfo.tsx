import {useEffect, useState} from 'react';
import ReactMarkdown from 'react-markdown';
import {useAsync} from 'react-use';

import {Dropdown, Skeleton} from 'antd';
import {CloudDownloadOutlined, DownOutlined} from '@ant-design/icons';

import styled from 'styled-components';
import {Icon} from '@monokle/components';

import {Colors} from '@shared/styles';
import {helmChartInfoCommand, runCommandInMainThread, searchHelmRepoCommand} from '@shared/utils/commands';

import PullHelmChartModal from '../PullHelmChartModal';

interface IProps {
  chartName: string;
}

const HelmInfo = ({chartName}: IProps) => {
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [chartVersion, setChartVersion] = useState('');
  const {value = '', loading} = useAsync(async () => {
    const result = await runCommandInMainThread(helmChartInfoCommand({name: chartName}));
    return result.stdout;
  }, [chartName]);

  const {value: data = [], loading: loadingVersions} = useAsync(async () => {
    const result = await runCommandInMainThread(searchHelmRepoCommand({q: chartName}, true));
    if (result.stderr) {
      throw new Error(result.stderr);
    }
    return JSON.parse(result.stdout || '[]');
  }, [chartName]);

  useEffect(() => {
    setChartVersion(data[0]?.version);
  }, [data]);

  const items = data.map((i: any) => ({label: i.version, key: i.version, onClick: () => setChartVersion(i.version)}));

  return loading || loadingVersions ? (
    <Skeleton active={loading} />
  ) : (
    <Container>
      <div>
        <ReactMarkdown>{value}</ReactMarkdown>
      </div>
      <Footer>
        <MenuDropdownList id="versions" style={{height: 300}} />
        <Dropdown.Button
          menu={{items}}
          size="large"
          type="primary"
          icon={<DownOutlined />}
          onClick={() => setConfirmModalOpen(true)}
          getPopupContainer={() => document.getElementById('versions')!}
        >
          <CloudDownloadOutlined />
          Download locally ({chartVersion})
        </Dropdown.Button>
        <Dropdown.Button
          menu={{items}}
          size="large"
          type="primary"
          icon={<DownOutlined />}
          onClick={() => setConfirmModalOpen(true)}
          getPopupContainer={() => document.getElementById('versions')!}
        >
          <Icon name="cluster-dashboard" />
          Install in cluster ({chartVersion})
        </Dropdown.Button>
      </Footer>
      <PullHelmChartModal
        open={confirmModalOpen}
        dismissModal={() => setConfirmModalOpen(false)}
        chartName={chartName}
        chartVersion={chartVersion}
      />
    </Container>
  );
};

export default HelmInfo;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const Footer = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 75px;
  padding: 16px 0;
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
