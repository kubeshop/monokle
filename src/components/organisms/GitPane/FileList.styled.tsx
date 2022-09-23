import {ListProps, List as RawList} from 'antd';

import {FileOutlined as RawFileOutlined} from '@ant-design/icons';

import {rgba} from 'polished';
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
  width: 100%;
`;

export const FileItemData = styled.div<{$isSelected: boolean}>`
  display: flex;
  align-items: center;
  color: ${({$isSelected}) => ($isSelected ? Colors.blackPure : Colors.blue10)};
  font-weight: 500;
`;

export const FileOutlined = styled(RawFileOutlined)<{$isSelected: boolean; $type: 'staged' | 'unstaged'}>`
  color: ${({$isSelected, $type}) =>
    $isSelected ? Colors.blackPure : $type === 'staged' ? Colors.grey9 : Colors.grey7};
`;

export const FilePath = styled.div<{$isSelected: boolean}>`
  color: ${({$isSelected}) => ($isSelected ? Colors.grey6 : Colors.grey7)};
  margin-left: 4px;
  font-size: 12px;
`;

export const FileStatus = styled.div<{$type: 'added' | 'deleted' | 'modified' | 'untracked'}>`
  height: 10px;
  width: 10px;
  border: ${({$type}) =>
    `1px solid ${
      $type === 'added' || $type === 'untracked' ? Colors.cyan8 : $type === 'deleted' ? Colors.volcano6 : Colors.yellow7
    }`};
  background-color: ${({$type}) =>
    $type === 'added' || $type === 'untracked'
      ? rgba(Colors.cyan8, 0.3)
      : $type === 'deleted'
      ? rgba(Colors.volcano6, 0.3)
      : rgba(Colors.yellow7, 0.3)};
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
