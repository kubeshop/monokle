import {Button, Skeleton as RawSkeleton, Tabs as RawTabs} from 'antd';

import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

export const ActionsPaneContainer = styled.div`
  height: 100%;
  width: 100%;
`;

export const ActionsPaneFooterContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;

  & .react-resizable {
    overflow-y: auto;
  }

  & .custom-handle {
    position: absolute;
    left: 0;
    right: 0;
    top: 0px;
    height: 3px;
    cursor: row-resize;
  }
`;

export const ActionsPaneMainContainer = styled.div<{$height: number}>`
  height: ${({$height}) => $height}px;
  width: 100%;
  display: flex;
  flex-direction: column;
`;

export const ExtraRightButton = styled(Button)`
  display: flex;
  align-items: center;
  padding: 4px 0px;
  margin-left: 10px;
`;

export const Skeleton = styled(RawSkeleton)`
  margin: 20px;
  padding: 8px;
  width: 95%;
`;

export const Tabs = styled(RawTabs)<{$height: number}>`
  width: 100%;
  height: ${({$height}) => `${$height}px`};
  overflow: visible;

  & .ant-tabs-nav {
    padding: 8px 16px 0 0;
    margin-bottom: 0px;
  }

  & .ant-tabs-nav::before {
    border-bottom: 1px solid #363636;
  }

  & .ant-tabs-content {
    height: ${({$height}) => $height - 46}px;
  }

  & .ant-tabs-extra-content {
    display: flex;
    align-items: center;
  }

  & .ant-tabs-tab {
    padding: 0px 16px;
    margin-left: 8px;
    background: black;
    border-radius: 5px 5px 0 0;
    border-bottom: 1px solid #363636;
    font-weight: bold;
    font-size: 12px;
  }

  & .ant-tabs-tab-active {
    border-bottom: 1px solid #363636;
    background: black;
  }

  & .ant-tabs-ink-bar {
    background: #363636;
  }
`;

export const HeaderWrapper = styled.div`
  background: ${Colors.grey1000};
  margin: 10px;
  border-radius: 10px;
`;
