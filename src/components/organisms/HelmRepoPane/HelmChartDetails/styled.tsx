import {Tabs as AntTabs, Typography} from 'antd';

import styled from 'styled-components';

import {IconButton} from '@monokle/components';
import {Colors} from '@shared/styles';

export const Container = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 34%;
  right: 0;
  z-index: 10;
  background: ${Colors.grey1};
  border-left: 1px solid ${Colors.grey4};
`;

export const Content = styled.div`
  position: relative;
  height: 100%;
`;

export const Header = styled.div`
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 28px;
  padding-bottom: 0;
`;

export const Title = styled(Typography.Text)`
  font-size: 16px;
  line-height: 18px;
  font-weight: 700;
  color: ${Colors.grey9};
`;

export const CloseButton = styled(IconButton)`
  background-color: unset;

  :hover {
    background-color: unset;
  }
`;

export const Tabs = styled(props => <AntTabs {...props} />)`
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
