import {Button, Skeleton as RawSkeleton, Tabs as RawTabs} from 'antd';

import styled from 'styled-components';

import {BackgroundColors} from '@styles/Colors';

export const Tabs = styled(RawTabs)`
  overflow: visible;

  & .ant-tabs-nav {
    padding: 0 16px;
    margin-bottom: 0px;
  }

  & .ant-tabs-nav::before {
    border-bottom: 1px solid #363636;
  }
`;

export const ActionsPaneContainer = styled.div<{$height: number}>`
  ${props => props.$height && `height: ${props.$height}px;`}
  width: 100%;
  background-color: ${BackgroundColors.darkThemeBackground};
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-content: start;
  align-items: start;
`;

export const TabsContainer = styled.div`
  flex-grow: 1;
  flex-basis: 0;
  width: 100%;
`;

export const TitleBarContainer = styled.div`
  display: flex;
  height: 24px;
  justify-content: space-between;
`;

export const RightButtons = styled.div`
  float: right;
  display: flex;
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
`;
