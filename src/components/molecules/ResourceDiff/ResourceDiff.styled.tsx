import {Tag as RawTag} from 'antd';

import styled from 'styled-components';

import Colors from '@styles/Colors';

export const MonacoDiffContainer = styled.div`
  width: 100%;
  height: 58vh;

  padding: 8px;
  & .monaco-editor .monaco-editor-background {
    background-color: ${Colors.grey1000} !important;
  }
  & .monaco-editor .margin {
    background-color: ${Colors.grey1000} !important;
  }
  & .diffOverview {
    background-color: ${Colors.grey1000} !important;
  }
`;

export const SwitchContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 12px;
`;

export const SwitchLabel = styled.span`
  margin-left: 8px;
  cursor: pointer;
`;

export const TagsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px;
  padding-bottom: 5px;
`;

export const Tag = styled(RawTag)`
  padding: 5px 10px;
  font-size: 14px;
  font-weight: 600;
`;
