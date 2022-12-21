import {Tabs as RawTabs} from 'antd';

import {SendOutlined as RawSendOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {Colors} from '@shared/styles';

export const SendOutlined = styled(RawSendOutlined)`
  transform: rotate(315deg) translate(3px, 0px);
`;

export const StartPageContainer = styled.div<{$height: number}>`
  width: 100%;
  height: ${({$height}) => $height}px;
  padding: 50px;
  background: ${Colors.black100};
  display: flex;
  flex-direction: column;
  gap: 50px;
`;

export const TabItemLabel = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
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

  .ant-tabs-tab {
    padding: 8px 24px 8px 0px !important;
    width: 190px;

    & .anticon {
      margin-right: 0px;
    }
  }
`;
