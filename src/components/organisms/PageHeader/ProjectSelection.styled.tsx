import {Menu, Button as RawButton, Divider as RawDivider, Input as RawInput, Table as RawTable} from 'antd';

import {
  DeleteOutlined as RawDeleteOutlined,
  DownOutlined as RawDownOutlined,
  FolderAddOutlined as RawFolderAddOutlined,
  FolderOpenOutlined as RawFolderOpenOutlined,
  FormatPainterOutlined as RawFormatPainterOutlined,
} from '@ant-design/icons';

import styled from 'styled-components';

import Colors from '@styles/Colors';

export const BackToProjectButton = styled(RawButton)`
  margin-right: 0px !important;
  padding: 0px;
  font-size: 12px;
  color: ${Colors.blue6};
`;

export const Button = styled(RawButton)`
  display: flex;
  align-items: center;
  margin-right: 0px !important;
  padding: 0px !important;
  width: 100% !important;

  :hover,
  :focus {
    color: ${Colors.lightSeaGreen};
  }
`;

export const DeleteOutlined = styled(RawDeleteOutlined)`
  color: ${Colors.red7};
  margin-left: 8px;
  &:hover {
    opacity: 0.8;
  }
`;

export const Divider = styled(RawDivider)`
  border-color: ${Colors.grey3};
  height: 1em;
`;

export const DownOutlined = styled(RawDownOutlined)`
  padding-top: 2px;
  position: absolute;
  right: 8px !important;
  color: ${Colors.whitePure};
`;

export const FolderAddOutlined = styled(RawFolderAddOutlined)`
  font-size: 20px;
  color: ${Colors.blue6};
  cursor: pointer;
`;

export const FolderOpenOutlined = styled(RawFolderOpenOutlined)`
  font-size: 14px;
  padding-top: 2px;
`;

export const FormatPainterOutlined = styled(RawFormatPainterOutlined)`
  font-size: 20px;
  color: ${Colors.blue6};
  cursor: pointer;
`;

export const ProjectFolderOpenOutlined = styled(RawFolderOpenOutlined)`
  font-size: 20px;
  color: ${Colors.blue6};
  cursor: pointer;
`;

export const ProjectContainer = styled.div`
  display: flex;
  align-items: center;
  border: none;
  border-radius: 4px;
  height: 28px;
  width: 180px;
  gap: 32px;
  background: ${Colors.grey3b};
  margin: 10px 0;
`;

export const ProjectMenu = styled(Menu)`
  background-color: ${Colors.grey1000};
  margin: 10px 0;
`;

export const ProjectLabel = styled.span`
  max-width: 200px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  font-weight: 600;
  font-size: 10px;
  letter-spacing: 0.05em;
  color: ${Colors.grey7};
  width: 56px;
  text-align: left;
  padding-left: 8px;
`;

export const ProjectName = styled.span`
  max-width: 104px;
  width: 100%;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  color: ${Colors.whitePure};
  font-weight: 600;
  font-size: 12px;
  text-align: left;
`;

export const ProjectsMenuActionsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 120px;
`;

export const ProjectsMenuContainer = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 16px;
`;

export const ProjectTableActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding-top: 4px;
`;

export const Search = styled(RawInput.Search)`
  width: 280px;
`;

export const Table = styled(props => <RawTable {...props} />)`
  width: 800px;
  border-top: 1px solid ${Colors.grey3};
  padding-top: 18px;
`;
