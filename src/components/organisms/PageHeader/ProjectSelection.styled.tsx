import {Dropdown, Menu, Button as RawButton, Divider as RawDivider, Input as RawInput, Table as RawTable} from 'antd';

import {
  DeleteOutlined as RawDeleteOutlined,
  DownOutlined as RawDownOutlined,
  FolderAddOutlined as RawFolderAddOutlined,
  FolderOpenOutlined as RawFolderOpenOutlined,
  FormatPainterOutlined as RawFormatPainterOutlined,
} from '@ant-design/icons';

import styled from 'styled-components';

import {GlobalScrollbarStyle} from '@utils/scrollbar';

import Colors from '@styles/Colors';

export const BackToProjectButton = styled(RawButton)`
  margin-right: 0px !important;
  padding: 0px;
  font-size: 12px;
  color: ${Colors.blue6};
`;

export const Button = styled(RawButton)`
  color: ${Colors.whitePure};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 10px;
  line-height: 20px;
  display: flex;
  align-items: center;
  margin-right: 0px !important;
  padding: 0px;
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
`;

export const FolderAddOutlined = styled(RawFolderAddOutlined)`
  font-size: 20px;
  color: ${Colors.blue6};
  cursor: pointer;
`;

export const FolderOpenOutlined = styled(RawFolderOpenOutlined)`
  color: ${Colors.whitePure};
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
  border: 1px solid ${Colors.grey3};
  border-radius: 4px;
  margin-right: 10px;
  padding: 0px 10px;
`;

export const ProjectMenu = styled(Menu)`
  background-color: ${Colors.grey1000};
`;

export const ProjectName = styled.span`
  max-width: 200px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  align-self: center;
`;

export const ProjectsDropdown = styled(Dropdown)<{$isClusterSelectorVisible: boolean}>`
  ${props => `margin-right: ${props.$isClusterSelectorVisible ? '20px' : '0px'}`};
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

export const Table = styled(RawTable)`
  width: 800px;
  border-top: 1px solid ${Colors.grey3};
  padding-top: 18px;
  ${GlobalScrollbarStyle}
`;
