import {Button, Skeleton as RawSkeleton, Tabs as RawTabs} from 'antd';

import styled from 'styled-components';

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

export const ActionsPaneMainContainer = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
`;

export const ExtraRightButton = styled(Button)`
  display: flex;
  align-items: center;
  padding: 4px 0px;
  margin-left: 10px;

  &:hover {
    svg {
      transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
      opacity: 0.6;
    }
  }
`;

export const Skeleton = styled(RawSkeleton)`
  margin: 20px;
  padding: 8px;
  width: 95%;
`;

export const Tabs = styled(RawTabs)`
  width: 100%;
  height: 100%;
  overflow: visible;

  & .ant-tabs-nav {
    padding: 0 16px;
    margin-bottom: 0px;
  }

  & .ant-tabs-nav::before {
    border-bottom: 1px solid #363636;
  }

  & .ant-tabs-content {
    height: 100%;
  }

  & .ant-tabs-extra-content {
    display: flex;
    align-items: center;
  }
`;
