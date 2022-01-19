import {FolderAddOutlined, FolderOpenOutlined, FormatPainterOutlined} from '@ant-design/icons';

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

export const StyledFolderOpenOutlined = styled(FolderOpenOutlined)`
  font-size: 56px;
  color: ${Colors.blue10};
  margin-bottom: 24px;
`;

export const StyledFolderAddOutlined = styled(FolderAddOutlined)`
  font-size: 56px;
  color: ${Colors.blue10};
  margin-bottom: 24px;
`;

export const StyledFormatPainterOutlined = styled(FormatPainterOutlined)`
  font-size: 56px;
  color: ${Colors.blue10};
  margin-bottom: 24px;
`;

export const StyledActionContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 0 40px;
  cursor: pointer;
`;

export const StyledActionText = styled.div`
  color: ${Colors.blue6};
  font-size: 12px;
`;

export const StyledActionTitle = styled.div`
  font-size: 22px;
  text-align: center;
  margin-bottom: 150px;
`;

export const StyledContainer = styled.div`
  width: 100%;
  height: calc(100vh - 112px);
  display: flex;
  justify-content: center;
  align-items: center;
  padding-bottom: 150px;
`;
