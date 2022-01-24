import {ReactElement} from 'react';

import {
  DropDownProps,
  Menu,
  Button as RawButton,
  Dropdown as RawDropdown,
  Input as RawInput,
  Table,
  TableProps,
} from 'antd';

import {
  BellOutlined as RawBellOutlined,
  CloseCircleOutlined as RawCloseCircleOutlined,
  ClusterOutlined as RawClusterOutlined,
  CopyOutlined as RawCopyOutlined,
  DeleteOutlined as RawDeleteOutlined,
  DownOutlined as RawDownOutlined,
  EditOutlined as RawEditOutlined,
  FolderAddOutlined as RawFolderAddOutlined,
  FolderOpenOutlined as RawFolderOpenOutlined,
  FormatPainterOutlined as RawFormatPainterOutlined,
  SettingOutlined as RawSettingOutlined,
} from '@ant-design/icons';

import styled from 'styled-components';

import Col from '@components/atoms/Col';
import * as RawHeader from '@components/atoms/Header';
import * as RawRow from '@components/atoms/Row';

import {GlobalScrollbarStyle} from '@utils/scrollbar';

import {AppBorders} from '@styles/Borders';
import Colors, {BackgroundColors, FontColors} from '@styles/Colors';

const {Search: RawSearch} = RawInput;

export const Button = styled(RawButton)`
  border-left: 1px solid ${Colors.grey3};
  padding: 0;
  padding-left: 8px;
  margin: 0;
  color: ${Colors.blue6};
  &:hover {
    color: ${Colors.blue6};
    opacity: 0.8;
  }
`;

export const ClusterButton = styled(RawButton)`
  border: none;
  outline: none;
  padding: 0px 8px;
`;

export const ClusterActionButton = styled(RawButton)`
  border: none;
  outline: none;
  margin-right: 8px;
  padding: 0px;
  color: ${Colors.blue6};
  font-size: 12px;
`;

export const ProjectButton = styled(RawButton)`
  display: flex;
  border: none;
  outline: none;
  padding: 0px 8px;
  color: ${Colors.whitePure};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 10px;
  line-height: 20px;

  :hover,
  :focus {
    color: ${Colors.lightSeaGreen};
  }
`;

export const FolderOpenOutlined = styled(RawFolderOpenOutlined)`
  color: ${Colors.whitePure};
  align-self: center;
`;

export const CLusterContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 4;
`;

export const CLusterStatus = styled.div`
  border: 1px solid ${Colors.grey3};
  border-radius: 4px;
  padding: 0px 8px;
  display: flex;
`;

export const CLusterStatusText = styled.span<{connected: Boolean}>`
  font-size: 10px;
  font-weight: 600;
  border-right: 1px solid ${Colors.grey3};
  padding-right: 8px;
  text-transform: uppercase;
  ${props => `color: ${props.connected ? Colors.greenOkayCompliment : Colors.whitePure}`};
`;

export const CLusterActionText = styled(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({className, children, highlighted}: {className?: string; children?: any; highlighted?: boolean}) => (
    <span className={className}>{children}</span>
  )
)`
  font-size: 12px;
  ${({highlighted}) => `
  font-size: ${highlighted ? '8px' : '12px'} !important;
  line-height: ${highlighted ? '32px' : '20px'} !important;
  color: ${highlighted ? Colors.whitePure : Colors.blue6} !important
  `};
`;

export const ClusterOutlined = styled(RawClusterOutlined)`
  font-size: 10px;
  margin-right: 4px;
  letter-spacing: 0.05em;
  font-weight: 600;
  line-height: 20px;
  text-transform: uppercase;
`;

export const Dropdown = styled(RawDropdown)``;

export const Logo = styled.img`
  height: 24px;
  margin: 4px;
  margin-top: 11px;
`;

export const Row = styled(RawRow.default)`
  display: flex;
  justify-content: space-between;
  flex-flow: inherit;
`;

export const LogoCol = styled(Col)`
  padding-left: 4px;
  flex: 1;
`;

export const Header = styled(RawHeader.default)`
  width: 100%;
  line-height: 30px;
  background: ${BackgroundColors.darkThemeBackground};
  border-bottom: ${AppBorders.pageDivider};
  min-height: 50px;
  z-index: 1;
  height: 30px;
`;

export const SettingsCol = styled(Col)`
  width: 100%;
  display: flex;
  flex-direction: row-reverse;
  flex: 1;
`;

export const SettingsOutlined = styled(RawSettingOutlined)`
  color: ${FontColors.elementSelectTitle};
  font-size: 24px;
  cursor: pointer;
`;

export const BellOutlined = styled(RawBellOutlined)`
  color: ${FontColors.elementSelectTitle};
  font-size: 24px;
  cursor: pointer;
`;

export const IconContainerSpan = styled.span`
  color: ${FontColors.elementSelectTitle};
  padding-top: 10px;
  padding-right: 10px;
  font-size: 24px;
  cursor: pointer;
`;

export const PreviewRow = styled(Row)`
  background: ${BackgroundColors.previewModeBackground};
  margin: 0;
  padding: 0 10px;
  height: 25px;
  color: ${Colors.blackPure};
  display: flex;
  justify-content: space-between;
`;

export const ClusterRow = styled(Row)`
  background: ${BackgroundColors.clusterModeBackground};
  margin: 0;
  padding: 0 10px;
  height: 25px;
  color: ${Colors.blackPure};
  display: flex;
  justify-content: space-between;
`;

export const ModeSpan = styled.span`
  font-weight: 500;
`;

export const ResourceSpan = styled.span`
  font-weight: 700;
`;

export const ExitButton = styled.span`
  cursor: pointer;
  &:hover {
    font-weight: 500;
  }
`;

export const CloseCircleOutlined = styled(RawCloseCircleOutlined)`
  margin-right: 5px;
`;

export const DeleteOutlined = styled(RawDeleteOutlined)`
  color: ${Colors.red7};
  margin-left: 8px;
  &:hover {
    opacity: 0.8;
  }
`;

export const EditOutlined = styled(RawEditOutlined)`
  color: ${Colors.blue6};
  margin-left: 8px;
  &:hover {
    opacity: 0.8;
  }
`;

export const CopyOutlined = styled(RawCopyOutlined)`
  color: ${Colors.blue6};
  &:hover {
    opacity: 0.8;
  }
`;

export const ProjectTableActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding-top: 4px;
`;

export const ProjectMenu = styled(Menu)`
  background-color: ${Colors.grey1000};
`;

export const ProjectFolderOpenOutlined = styled(FolderOpenOutlined)`
  font-size: 20px;
  color: ${Colors.blue6};
  cursor: pointer;
`;

export const ProjectFolderAddOutlined = styled(RawFolderAddOutlined)`
  font-size: 20px;
  color: ${Colors.blue6};
  cursor: pointer;
`;

export const ProjectFormatPainterOutlined = styled(RawFormatPainterOutlined)`
  font-size: 20px;
  color: ${Colors.blue6};
  cursor: pointer;
`;
export const DownOutlined = styled(RawDownOutlined)`
  margin: 4px;
  align-self: center;
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

export const Search = styled(RawSearch)`
  width: 280px;
`;

export const ProjectName = styled.span`
  max-width: 200px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  align-self: center;
`;

interface ProjectsTableProps extends TableProps<any> {
  children: ReactElement[];
}

export const ProjectsTable = styled(({children, ...rest}: ProjectsTableProps) => <Table {...rest}> {children}</Table>)`
  width: 800px;
  border-top: 1px solid ${Colors.grey3};
  padding-top: 18px;
  ${GlobalScrollbarStyle}
`;

interface ProjectsDropdownProps extends DropDownProps {
  children: ReactElement;
}

export const ProjectsDropdown = styled(({children, ...rest}: ProjectsDropdownProps) => (
  <Dropdown {...rest}>{children}</Dropdown>
))`
  border: 1px solid ${Colors.grey3};
  border-radius: 4px;
  padding: 0px 8px;
`;

export const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;
