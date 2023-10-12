import {Button, Skeleton as RawSkeleton, Tabs as RawTabs} from 'antd';

import styled from 'styled-components';

import {Colors} from '@shared/styles';

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
  display: flex;
  height: ${({$height}) => $height}px;
  flex-direction: column;
  border-radius: 10px;
  background-color: ${Colors.black100};
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
  padding: 0px 16px 0px 16px;
  margin-top: -10px;

  & .ant-tabs-nav {
    padding: 0px 16px 0 0;
    margin-bottom: 10px;
    background: rgba(25, 31, 33, 0.7);
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
    min-height: 35px;
  }

  & .ant-tabs-nav-wrap {
    padding-top: 11px;
  }

  & .ant-tabs-nav::before {
    border-bottom: none;
  }

  & .ant-tabs-content {
    height: ${({$height}) => $height - 46}px;
  }

  & .ant-tabs-extra-content {
    display: flex;
    align-items: center;
    transform: translateY(3px);
  }

  & .ant-tabs-tab {
    padding: 0px 16px;
    margin-left: 8px;
    background: black;
    border-radius: 5px 5px 0 0;
    border-bottom: none;
    font-weight: bold;
    font-size: 12px;
    background: ${Colors.grey10};
    color: ${Colors.blue7};
  }

  & .ant-tabs-tab-active {
    border-bottom: none;
    background: ${Colors.black100};

    & .ant-tabs-tab-btn {
      color: ${Colors.grey9};
    }
  }

  & .ant-tabs-ink-bar {
    background: transparent;
  }
`;
