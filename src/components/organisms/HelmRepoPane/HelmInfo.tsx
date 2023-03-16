import {useState} from 'react';
import ReactMarkdown from 'react-markdown';
import {useAsync} from 'react-use';

import {Button, Skeleton} from 'antd';

import styled from 'styled-components';

import {Colors} from '@shared/styles';
import {helmChartInfoCommand, runCommandInMainThread} from '@shared/utils/commands';

import PullHelmChartModal from './PullHelmChartModal';

interface IProps {
  chartName: string;
}

const HelmInfo = ({chartName}: IProps) => {
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const {value = '', loading} = useAsync(async () => {
    const result = await runCommandInMainThread(helmChartInfoCommand({name: chartName}));
    return result.stdout;
  }, [chartName]);
  return loading ? (
    <Skeleton active={loading} />
  ) : (
    <Container>
      <div>
        <ReactMarkdown>{value}</ReactMarkdown>
      </div>
      <Footer>
        <Button size="large" type="primary" onClick={() => setConfirmModalOpen(true)}>
          Pull helm chart
        </Button>
      </Footer>
      <PullHelmChartModal
        open={confirmModalOpen}
        dismissModal={() => setConfirmModalOpen(false)}
        chartName={chartName}
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
  border-top: 1px solid ${Colors.grey4};
  padding: 20px 28px;
`;
