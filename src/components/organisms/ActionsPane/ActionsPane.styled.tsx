import {Button, Skeleton as RawSkeleton, Tabs as RawTabs} from 'antd';

import styled from 'styled-components';

import {GlobalScrollbarStyle} from '@utils/scrollbar';

export const Tabs = styled(RawTabs)<{$height: number; $width: number}>`
  ${({$height, $width}) => `
    height: ${$height}px;
    width: ${$width}px;
  `};
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
`;

export const ActionsPaneContainer = styled.div`
  height: 100%;
  width: 100%;

  display: grid;
  grid-template-rows: 1fr max-content;
`;

export const ActionsPaneFooterContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;

  & .react-resizable {
    overflow-y: auto;

    ${GlobalScrollbarStyle}
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
  display: grid;
  grid-template-rows: max-content 1fr;
`;

export const DiffButton = styled(Button)`
  margin-left: 8px;
  margin-right: 4px;
`;

export const SaveButton = styled(Button)`
  margin-right: 8px;
`;

export const Skeleton = styled(RawSkeleton)`
  margin: 20px;
  padding: 8px;
  width: 95%;
`;

export const LeftArrowButton = styled(Button)`
  margin-right: 5px;
`;

export const RightArrowButton = styled(Button)`
  margin-right: 10px;
`;

export const ExtraRightButton = styled(Button)`
  padding: 4px 0px;
  margin-left: 10px;
`;
