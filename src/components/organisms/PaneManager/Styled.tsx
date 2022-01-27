import {Skeleton as RawSkeleton} from 'antd';

import styled from 'styled-components';

import {Col} from '@atoms';

import {AppBorders} from '@styles/Borders';
import Colors, {BackgroundColors} from '@styles/Colors';

export const GettingStartedPaneContainer = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;
`;

export const StartProjectPaneContainer = styled.div`
  flex: 3;
`;
export const RecentProjectsPaneContainer = styled.div`
  flex: 1;
  border-left: 1px solid ${Colors.grey3};
  max-width: 28vw;
`;

export const Row = styled.div`
  background-color: ${BackgroundColors.darkThemeBackground};
  width: 100%;
  padding: 0px;
  margin: 0px;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
`;
export const ColumnLeftMenu = styled(Col)`
  background-color: ${BackgroundColors.darkThemeBackground};
  height: 100%;
  padding: 0px;
  margin: 0px;
  border-right: ${AppBorders.pageDivider};
`;
export const ColumnPanes = styled(Col)`
  background-color: ${BackgroundColors.darkThemeBackground};
  height: 100%;
  padding: 0px;
  margin: 0px;
  overflow-x: visible !important;
  overflow-y: visible !important;
`;
export const ColumnRightMenu = styled(Col)`
  background-color: ${BackgroundColors.darkThemeBackground};
  height: 100%;
  padding: 0px;
  margin: 0px;
  border-left: ${AppBorders.pageDivider};
`;

export const Skeleton = styled(RawSkeleton)`
  padding: 8px 16px;
`;
