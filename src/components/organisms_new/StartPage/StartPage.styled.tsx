import {Tabs as RawTabs} from 'antd';

import styled from 'styled-components';

import {Colors} from '@shared/styles';

export const StartPageContainer = styled.div<{$height: number}>`
  width: 100%;
  height: ${({$height}) => $height}px;
  padding: 50px;
  background: ${Colors.black100};
`;

export const Tabs = styled(RawTabs)`
  .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
    color: ${Colors.geekblue9};
    font-weight: 700;
  }

  .ant-tabs-tab-btn {
    font-size: 16px;
    color: ${Colors.grey9};
  }

  .ant-tabs-ink-bar {
    height: 0 !important;
  }

  .ant-tabs-content-holder {
    border-left: none;
  }
`;
