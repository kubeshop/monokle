import {
  FolderAddOutlined as RawFolderAddOutlined,
  FolderOpenOutlined as RawFolderOpenOutlined,
  FormatPainterOutlined as RawFormatPainterOutlined,
} from '@ant-design/icons';

import styled from 'styled-components';

import Colors from '@styles/Colors';

export const TitleBarContainer = styled.div`
  display: flex;
  height: 24px;
  justify-content: space-between;
`;

export const Title = styled.span`
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  padding-right: 10px;
`;

export const FolderOpenOutlined = styled(RawFolderOpenOutlined)`
  font-size: 56px;
  color: ${Colors.blue10};
  margin-bottom: 24px;
`;

export const FolderAddOutlined = styled(RawFolderAddOutlined)`
  font-size: 56px;
  color: ${Colors.blue10};
  margin-bottom: 24px;
`;

export const FormatPainterOutlined = styled(RawFormatPainterOutlined)`
  font-size: 56px;
  color: ${Colors.blue10};
  margin-bottom: 24px;
`;

export const ActionContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 0 40px;
  cursor: pointer;
`;

export const ActionText = styled.div`
  color: ${Colors.blue6};
  font-size: 12px;
  text-align: center;
`;

export const ActionTitle = styled.div`
  font-size: 22px;
  text-align: center;
  margin-bottom: 150px;
`;

export const Container = styled.div`
  width: 100%;
  height: calc(100vh - 112px);
  display: flex;
  justify-content: center;
  align-items: center;
  padding-bottom: 150px;
`;
