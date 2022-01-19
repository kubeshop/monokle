import {ReactElement} from 'react';

import {Button, DropDownProps, Dropdown, Input, Menu} from 'antd';

import {
  BellOutlined,
  CloseCircleOutlined,
  ClusterOutlined,
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  FolderAddOutlined,
  FolderOpenOutlined,
  FormatPainterOutlined,
  SettingOutlined,
} from '@ant-design/icons';

import styled from 'styled-components';

import Col from '@components/atoms/Col';
import Header from '@components/atoms/Header';
import Row from '@components/atoms/Row';

import {AppBorders} from '@styles/Borders';
import Colors, {BackgroundColors, FontColors} from '@styles/Colors';

const {Search} = Input;

export const StyledButton = styled(Button)`
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

export const StyledClusterButton = styled(Button)`
  border: none;
  outline: none;
  padding: 0px 8px;
`;

export const StyledClusterActionButton = styled(Button)`
  border: none;
  outline: none;
  padding: 0px;
  color: ${Colors.blue6};
  font-size: 12px;
`;

export const StyledProjectButton = styled(Button)`
  border: none;
  outline: none;
  padding: 0px 8px;
  color: ${Colors.whitePure};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 10px;
  line-height: 20px;
`;

export const StyledFolderOpenOutlined = styled(FolderOpenOutlined)`
  color: ${Colors.whitePure};
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

export const StyledClusterOutlined = styled(ClusterOutlined)`
  font-size: 10px;
  margin-right: 4px;
  letter-spacing: 0.05em;
  font-weight: 600;
  line-height: 20px;
  text-transform: uppercase;
`;

export const StyledDropdown = styled(Dropdown)``;

export const StyledLogo = styled.img`
  height: 24px;
  margin: 4px;
  margin-top: 11px;
`;

export const StyledRow = styled(Row)`
  display: flex;
  justify-content: space-between;
  flex-flow: inherit;
`;

export const LogoCol = styled(Col)`
  padding-left: 4px;
  flex: 1;
`;

export const StyledHeader = styled(Header)`
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

export const StyledSettingsOutlined = styled(SettingOutlined)`
  color: ${FontColors.elementSelectTitle};
  font-size: 24px;
  cursor: pointer;
`;

export const StyledBellOutlined = styled(BellOutlined)`
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

export const StyledModeSpan = styled.span`
  font-weight: 500;
`;

export const StyledResourceSpan = styled.span`
  font-weight: 700;
`;

export const StyledExitButton = styled.span`
  cursor: pointer;
  &:hover {
    font-weight: 500;
  }
`;

export const StyledCloseCircleOutlined = styled(CloseCircleOutlined)`
  margin-right: 5px;
`;

export const StyledDeleteOutlined = styled(DeleteOutlined)`
  color: ${Colors.red7};
  margin-left: 8px;
  &:hover {
    opacity: 0.8;
  }
`;

export const StyledEditOutlined = styled(EditOutlined)`
  color: ${Colors.blue6};
  margin-left: 8px;
  &:hover {
    opacity: 0.8;
  }
`;

export const StyledCopyOutlined = styled(CopyOutlined)`
  color: ${Colors.blue6};
  &:hover {
    opacity: 0.8;
  }
`;

export const StyledProjectTableActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding-top: 4px;
`;

export const StyledProjectMenu = styled(Menu)`
  background-color: ${Colors.grey1000};
`;

export const StyledProjectFolderOpenOutlined = styled(FolderOpenOutlined)`
  font-size: 20px;
  color: ${Colors.blue6};
  cursor: pointer;
`;

export const StyledProjectFolderAddOutlined = styled(FolderAddOutlined)`
  font-size: 20px;
  color: ${Colors.blue6};
  cursor: pointer;
`;

export const StyledProjectFormatPainterOutlined = styled(FormatPainterOutlined)`
  font-size: 20px;
  color: ${Colors.blue6};
  cursor: pointer;
`;

export const StyledProjectsMenuActionsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 120px;
`;

export const StyledProjectsMenuContainer = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 16px;
`;

export const StyledSearch = styled(Search)`
  width: 280px;
`;

interface StyledProjectsDropdownProps extends DropDownProps {
  isClusterSelectorVisible: boolean | undefined;
  children: ReactElement;
}

export const StyledProjectsDropdown = styled(({children, ...rest}: StyledProjectsDropdownProps) => (
  <Dropdown {...rest}>{children}</Dropdown>
))`
  ${props => `margin-right: ${props.isClusterSelectorVisible ? '20px' : '0px'}`};
`;
