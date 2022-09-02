// import {Button, Skeleton, Tabs as RawTabs} from 'antd';
import styled from 'styled-components';

import Colors from '@styles/Colors';

export const GitPaneContainer = styled.div`
  height: 100%;
  width: 100%;
`;

export const GitPaneMainContainer = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
`;

export const MonacoDiffContainer = styled.div<{width: string}>`
  ${props => `
    width: ${props.width};
  `}

  height: 100%;

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

export const EmptyStateContainer = styled.div`
  display: flex;
  height: 100%;
  border-top: 1px solid ${Colors.grey3};
`;

export const EmptyStateItem = styled.div`
  border-right: 1px solid ${Colors.grey3};
  width: 50%;
  height: 100%;
`;

export const GitEmptyImage = styled.img`
  margin-top: 45px;
  display: block;
  margin-left: auto;
  margin-right: auto;
  width: 295px;
`;

export const GitFileBar = styled.div`
  display: flex;
  width: 100%;
`;

export const GitRefFile = styled.div`
  display: flex;
  align-items: center;
  padding-top: 10px;
  margin-left: 16px;
  padding-bottom: 10px;
  width: 50%;
  border-right: 1px solid ${Colors.grey3};
`;

export const GitChangedFile = styled.div`
  display: flex;
  padding-top: 10px;
  margin-left: 16px;
  padding-bottom: 10px;
  width: 50%;
`;

export const FileType = styled.div<{type?: string}>`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 4px 16px;
  gap: 32px;
  width: 84px;
  height: 24px;
  background: #1d1d1d;
  border-radius: 4px;
  font-weight: 600;
  font-size: 10px;
  line-height: 20px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-right: 13px;
  color: ${props => (props.type === 'changed' ? Colors.cyan7 : Colors.blue10)};
  background: ${props => (props.type === 'changed' ? '#1D1D1D' : '#182928')};
`;

export const FileEmptyState = styled.div`
  width: 50%;
`;

export const FileName = styled.div`
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.blue10};
`;

export const FilePath = styled.div`
  margin-left: 8px;
  font-weight: 400;
  font-size: 12px;
  line-height: 20px;
  color: ${Colors.grey7};
`;
