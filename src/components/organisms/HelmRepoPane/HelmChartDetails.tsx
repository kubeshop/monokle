import {Dispatch, useMemo} from 'react';

import {Tabs as AntTabs, Typography} from 'antd';

import {CloseOutlined} from '@ant-design/icons';

import {Tab} from 'rc-tabs/lib/interface';
import styled from 'styled-components';

import {IconButton} from '@monokle/components';
import {Colors} from '@shared/styles';

import HelmInfo from './HelmInfo';
import HelmTemplate from './HelmTemplate';
import HelmValues from './HelmValues';
import HelmReadme from './HemlReadme';

const createTabItems = (chartName: string): Tab[] => [
  {
    key: 'info',
    label: 'Info',
    children: <HelmInfo chartName={chartName} />,
  },
  {
    key: 'templates',
    label: 'Templates',
    children: <HelmTemplate chartName={chartName} />,
  },
  {
    key: 'defaultValues',
    label: 'Default Values',
    children: <HelmValues chartName={chartName} />,
  },
  {
    key: 'readme',
    label: 'Readme',
    children: <HelmReadme chartName={chartName} />,
  },
];

interface IProps {
  chart: string;
  onDismissPane: Dispatch<null>;
}

const HelmChartDetails = ({chart, onDismissPane}: IProps) => {
  const chartName = chart.split('/')[1];

  const tabItems = useMemo(() => createTabItems(chart), [chart]);

  return (
    <Container>
      <Content>
        <Header>
          <Title>{chartName}</Title>
          <CloseButton onClick={() => onDismissPane(null)}>
            <CloseOutlined />
          </CloseButton>
        </Header>
        <Tabs style={{height: '100%'}} items={tabItems} />
      </Content>
    </Container>
  );
};

export default HelmChartDetails;

const Container = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 40%;
  right: 0;
  z-index: 10;
  background: ${Colors.grey1};
  border-left: 1px solid ${Colors.grey4};
`;

const Content = styled.div`
  position: relative;
  height: 100%;
`;

const Header = styled.div`
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 28px;
  padding-bottom: 0;
`;

const Title = styled(Typography.Text)`
  font-size: 16px;
  line-height: 18px;
  font-weight: 700;
  color: ${Colors.grey9};
`;

const CloseButton = styled(IconButton)`
  background-color: unset;

  :hover {
    background-color: unset;
  }
`;

const Tabs = styled(props => <AntTabs {...props} />)`
  height: 100%;

  .ant-tabs-content-holder {
    overflow-y: auto;
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
