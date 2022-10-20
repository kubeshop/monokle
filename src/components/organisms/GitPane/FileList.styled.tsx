import {ListProps, List as RawList} from 'antd';

import {FileOutlined as RawFileOutlined} from '@ant-design/icons';

import {rgba} from 'polished';
import styled from 'styled-components';

import {GitChangedFile, GitChangedFileType} from '@models/git';

import Colors from '@styles/Colors';

html{
 font-size : 10px;
}

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

export const FileItemData = styled.div<{$isSelected: boolean}>`
  width: 90%;
  display: flex;
  align-items: center;
  color: ${({$isSelected}) => ($isSelected ? Colors.blackPure : Colors.blue10)};
  font-weight: 500;
`;

export const FileName = styled.div`
  max-width: 60%;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

export const FileOutlined = styled(RawFileOutlined)<{$isSelected: boolean; $type: 'staged' | 'unstaged'}>`
  color: ${({$isSelected, $type}) =>
    $isSelected ? Colors.blackPure : $type === 'staged' ? Colors.grey9 : Colors.grey7};
`;

export const FilePath = styled.div<{$isSelected: boolean}>`
  color: ${({$isSelected}) => ($isSelected ? Colors.grey6 : Colors.grey7)};
  max-width: 40%;
  margin-left: 4px;
  font-size: 1.2rem;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

export const FileItemOperations = styled.div`
  min-width: 5%;
  max-width: 10%;
`;

export const FileStatus = styled.div<{$type: GitChangedFileType}>`
  height: 10px;
  width: 10px;
  border: ${({$type}) =>
    `1px solid ${
      $type === 'added' || $type === 'untracked'
        ? Colors.cyan8
        : $type === 'deleted'
        ? Colors.volcano6
        : $type === 'modified'
        ? Colors.yellow7
        : Colors.whitePure
    }`};
  background-color: ${({$type}) =>
    $type === 'added' || $type === 'untracked'
      ? rgba(Colors.cyan8, 0.3)
      : $type === 'deleted'
      ? rgba(Colors.volcano6, 0.3)
      : $type === 'modified'
      ? rgba(Colors.yellow7, 0.3)
      : rgba(Colors.whitePure, 0.3)};

  border-radius: 3px;
  margin-right: 8px;
  margin-top: 1px;
`;

export const List = styled((props: ListProps<GitChangedFile>) => <RawList<GitChangedFile> {...props} />)`
  margin-top: -6px;

  .ant-list-item {
    border-bottom: none;
    padding: 6px 14px;
    margin-bottom: 6px;
  }

  .ant-list-empty-text {
    display: none;
  }
`;
