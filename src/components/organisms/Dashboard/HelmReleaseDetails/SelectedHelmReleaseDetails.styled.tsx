import {Tabs as AntTabs, Typography} from 'antd';

import styled from 'styled-components';

import {Colors} from '@shared/styles';

export const Container = styled.div`
  padding: 28px;
  height: 100%;
`;

export const Tabs = styled(props => <AntTabs {...props} />)`
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

    :hover {
      color: ${Colors.grey9};
    }
  }

  & .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
    color: ${Colors.grey9};
  }

  & .ant-tabs-ink-bar {
    background-color: ${Colors.grey9};
  }
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

export const Title = styled(Typography.Text)`
  font-size: 24px;
  font-weight: 700;
  line-height: 22px;
  color: ${Colors.grey9};
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  min-width: 0;
  max-width: 50%;
`;

export const ActionsContainer = styled.div`
  display: flex;
  gap: 16px;
`;
