import {FileOutlined as RawFileOutlined} from '@ant-design/icons';

import styled from 'styled-components';

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

export const FileItemData = styled.div`
  display: flex;
  align-items: center;
  color: ${Colors.blue10};
`;

export const FileOutlined = styled(RawFileOutlined)<{$type: 'staged' | 'unstaged'}>`
  color: ${({$type}) => ($type === 'staged' ? Colors.grey9 : Colors.grey7)};
`;

export const FilePath = styled.div`
  color: ${Colors.grey9};
  margin-left: 4px;
  font-size: 12px;
`;
