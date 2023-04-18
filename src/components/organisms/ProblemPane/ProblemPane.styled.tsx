import {Tabs as RawTabs} from 'antd';

import styled from 'styled-components';

import {BackgroundColors} from '@shared/styles';

export const ProblemPaneContainer = styled.div`
  background-color: ${BackgroundColors.darkThemeBackground};
  height: 100%;
  padding: 10px 10px 25px 25px;
  display: grid;
  grid-template-rows: max-content 1fr max-content;
  grid-gap: 15px;
`;

export const Tabs = styled(RawTabs)`
  width: 100%;
  margin-top: -15px;

  & .ant-tabs-nav {
    padding: 8px 16px 0 0;
    margin-bottom: 0px;
    background: rgba(25, 31, 33, 0.7);
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
  }

  & .ant-tabs-content {
    height: 100%;
  }

  & .ant-tabs-nav::before {
    border-bottom: none;
  }

  & .ant-tabs-tab {
    padding: 5px 16px;
    margin-left: 8px;
    background: black;
    border-radius: 5px 5px 0 0;
    border-bottom: none;
    font-weight: bold;
    font-size: 12px;
  }

  & .ant-tabs-tab-active {
    border-bottom: none;
    background: black;
  }

  & .ant-tabs-ink-bar {
    background: transparent;
  }
`;
