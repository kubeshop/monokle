import {Tabs as RawTabs} from 'antd';

import styled from 'styled-components';

import {BackgroundColors, Colors} from '@shared/styles';

export const ProblemPaneContainer = styled.div`
  background-color: ${BackgroundColors.darkThemeBackground};
  height: 100%;
  padding: 10px 10px 25px 25px;
  display: grid;
  grid-template-rows: max-content 1fr max-content;
  grid-gap: 15px;
`;

export const MainBox = styled.div`
  height: 100%;
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
`;
export const TextContainer = styled.div`
  display: grid;
  grid-template-columns: 119px 119px 139px 150px;
  grid-column-gap: 50px;
  padding: 20px 20px 27px 48px;
  width: 756px;
  border-radius: 4px;
  border: 1px solid ${Colors.grey4};
`;

export const TextTitle = styled.div`
  color: ${Colors.geekblue8};
  font-size: 24px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  margin: 30px 0px 30px 0px;
`;

export const Text = styled.div`
  color: ${Colors.grey8};
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 24px; /* 171.429% */
  margin: 10px 0px 20px 0px;
`;

export const MainColumn = styled.div`
  grid-column: 1 / 4;
  grid-row: 1;
`;

export const ImageColumn = styled.div`
  grid-column: 4;
  grid-row: 1 / 5;
`;

export const ValidationImage = styled.img`
  width: 150px;
  height: 138px;
  margin-top: 40px;
`;

export const TextColumn1 = styled.div`
  grid-column: 1 / 2;
  grid-row: 2;
`;

export const TextColumn2 = styled.div`
  grid-column: 2 / 3;
  grid-row: 2;
`;

export const TextColumn3 = styled.div`
  grid-column: 3 / 4;
  grid-row: 2;
  padding-right: 20px;
`;

export const TextIcon = styled.img`
  cursor: pointer;
  height: 32px;
  width: 32px;
  margin-bottom: 15px;
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
