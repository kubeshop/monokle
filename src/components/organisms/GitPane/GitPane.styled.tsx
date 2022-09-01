import {Button} from 'antd';

import styled from 'styled-components';

import Colors from '@styles/Colors';

export const GitPaneContainer = styled.div`
  height: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
`;

export const FileList = styled.div`
  display: flex;
  flex-direction: column;
`;
export const FilesAction = styled.div``;

export const Files = styled.div`
  margin-top: 12px;
  height: 100%;
  margin-left: 14px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

export const SelectAll = styled.div``;

export const List = styled.ol`
  height: 100%;
  list-style-type: none;
  padding: 0;
  padding-bottom: 20px;
  overflow-y: auto;
  margin: 0;
`;

export const ChangeList = styled.div`
  font-weight: 700;
  font-size: 14px;
  line-height: 22px;
  color: ${Colors.whitePure};
  display: flex;
  align-items: center;
`;

export const ChangeListStatus = styled.div`
  color: ${Colors.grey9};
  margin-left: 4px;
  font-weight: normal;
  font-size: 12px;
  line-height: 22px;
`;

export const FileIcon = styled.div`
  margin-left: 12.5px;
  margin-right: 7.5px;
`;

export const FileItem = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

export const FileItemData = styled.div`
  display: flex;
  align-items: center;
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
  color: ${Colors.blue10};
`;

export const FilePath = styled.div`
  color: ${Colors.grey9};
  margin-left: 4px;
  font-weight: normal;
  font-size: 12px;
  line-height: 22px;
`;
