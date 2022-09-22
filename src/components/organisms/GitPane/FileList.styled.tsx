import {ListProps, List as RawList} from 'antd';

import {FileOutlined as RawFileOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {GitChangedFile} from '@models/git';

import Colors from '@styles/Colors';

export const FileIcon = styled.div`
  margin-left: 12.5px;
  margin-right: 7.5px;
`;

export const FileItem = styled.div`
  display: flex;
  justify-content: space-between;
  cursor: pointer;
  width: 95%;
`;

export const FileItemData = styled.div`
  width: 90%;
  display: flex;
  align-items: center;
  color: ${Colors.blue10};
`;

export const FileOutlined = styled(RawFileOutlined)<{$type: 'staged' | 'unstaged'}>`
  color: ${({$type}) => ($type === 'staged' ? Colors.grey9 : Colors.grey7)};
`;

export const FileName = styled.div`
  max-width: 60%;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

export const FilePath = styled.div`
  max-width: 40%;
  color: ${Colors.grey7};
  margin-left: 4px;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

export const FileItemOperations = styled.div`
  min-width: 5%;
  max-width: 10%;
`;

export const List = styled((props: ListProps<GitChangedFile>) => <RawList<GitChangedFile> {...props} />)`
  margin-top: -6px;

  .ant-list-item {
    border-bottom: none;
    padding: 6px 14px;
    margin-bottom: 6px;
  }
`;
