import {Button, Skeleton, Tabs} from 'antd';

import styled from 'styled-components';

import {PaneContainer} from '@atoms';

export const StyledTabs = styled(Tabs)`
  overflow: visible;

  & .ant-tabs-nav {
    padding: 0 16px;
    margin-bottom: 0px;
  }

  & .ant-tabs-nav::before {
    border-bottom: 1px solid #363636;
  }
`;

export const ActionsPaneContainer = styled(PaneContainer)`
  height: 100%;
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

export const StyledSkeleton = styled(Skeleton)`
  margin: 20px;
  padding: 8px;
  width: 95%;
`;

export const StyledLeftArrowButton = styled(Button)`
  margin-right: 5px;
`;

export const StyledRightArrowButton = styled(Button)`
  margin-right: 10px;
`;

export const StyledExtraRightButton = styled(Button)`
  padding: 4px 0px;
`;
