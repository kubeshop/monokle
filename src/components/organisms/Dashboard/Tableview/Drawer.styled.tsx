import {Button, Drawer as RawDrawer, Tabs as RawTabs} from 'antd';

import {LeftOutlined as RawLeftOutlined, RightOutlined as RawRightOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

export const Drawer = styled(RawDrawer)`
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

export const DrawerTitle = styled.div`
  font-size: 16px;
  color: ${Colors.grey9};
  font-weight: 700;
`;

export const TabsContainer = styled.div`
  height: 100%;
`;

export const Tabs = styled(RawTabs)`
  overflow: hidden;
  grid-area: tab-content;
  height: 100%;

  & .ant-tabs-nav {
    padding: 0 24px;
    margin: 0;

    .ant-tabs-nav-list {
      font-weight: 400;
      font-size: 14px;
      color: ${Colors.grey9};

      .ant-tabs-tab {
        padding: 16px 0px;
      }

      .ant-tabs-tab-active {
        font-weight: 600;
      }
    }
  }

  & .ant-tabs-content {
    height: 100%;
    padding: 8px;

    & .ant-tabs-tabpane {
      height: 100%;
    }
  }
`;

export const TabsFooter = styled.div`
  grid-area: footer;
  padding: 0 24px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  border-top: 1px solid ${Colors.grey4};
`;

export const NavigationButtons = styled.div`
  display: flex;
  align-items: center;

  & > button:first-child {
    margin-right: 8px;
  }
`;

export const ActionButtons = styled.div``;

export const NavigationButton = styled(Button)`
  background-color: ${Colors.blue7};
  border-radius: 2px;
  padding: 0px 10px;
  height: 40px;

  &:hover,
  &:focus {
    background-color: ${Colors.blue7}88;
  }
`;

export const ActionButton = styled(Button)`
  background-color: ${Colors.blue7};
  border-radius: 2px;
  padding: 0px 10px;
  height: 40px;
  font-weight: 400;
  font-size: 14px;

  &:hover,
  &:focus {
    color: ${Colors.grey9};
    background-color: ${Colors.blue7}88;
  }
`;

export const LeftOutlined = styled(RawLeftOutlined)`
  color: ${Colors.grey9};
  font-size: 18px;
`;
export const RightOutlined = styled(RawRightOutlined)`
  color: ${Colors.grey9};
  font-size: 18px;
`;

export const ErrorCount = styled.div`
  color: ${Colors.whitePure};
  background-color: ${Colors.red7};
  font-weight: 700;
  font-size: 10px;
  border-radius: 100%;
  width: 18px;
  height: 18px;
  display: flex;
  justify-content: center;
  align-items: center;
  letter-spacing: -1px;
  padding: 0 2px 0 0;
  margin: 2px 0 2px 12px;
  cursor: pointer;
`;

export const TitleContainer = styled.div`
  display: flex;
  align-items: center;
`;
