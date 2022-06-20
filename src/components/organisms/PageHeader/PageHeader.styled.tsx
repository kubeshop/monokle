import {Button as RawButton, Divider as RawDivider} from 'antd';

import {
  BellOutlined as RawBellOutlined,
  CloseCircleOutlined as RawCloseCircleOutlined,
  CopyOutlined as RawCopyOutlined,
  EditOutlined as RawEditOutlined,
  EllipsisOutlined as RawEllipsisOutlined,
} from '@ant-design/icons';

import styled from 'styled-components';

import {Col} from '@components/atoms';
import * as RawHeader from '@components/atoms/Header';
import * as RawRow from '@components/atoms/Row';

import {AppBorders} from '@styles/Borders';
import Colors, {BackgroundColors, FontColors, PanelColors} from '@styles/Colors';

import {getPreviewTheme} from './ClusterSelection.styled';

export const AutosavingContainer = styled.div`
  margin-left: 10px;
  color: ${Colors.grey7};
  display: flex;
  align-items: center;
  gap: 5px;
`;

export const AutosavingErrorContainer = styled.div`
  display: flex;
  align-items: center;
  color: ${Colors.red6};
`;

export const Row = styled(RawRow.default)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0px 10px;
`;

export const BellOutlined = styled(RawBellOutlined)`
  color: ${FontColors.elementSelectTitle};
  font-size: 1rem;
  cursor: pointer;
  margin-left: 1.5rem;
`;

export const CloseCircleOutlined = styled(RawCloseCircleOutlined)`
  margin-right: 5px;
`;

export const ClusterRow = styled(Row)`
  background: ${BackgroundColors.clusterModeBackground};
  margin: 0;
  height: 8px;
  color: ${Colors.blackPure};
  display: flex;
  justify-content: space-between;
`;

export const CopyOutlined = styled(RawCopyOutlined)`
  color: ${Colors.blue6};
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

export const ExitButton = styled.span`
  cursor: pointer;
  &:hover {
    font-weight: 500;
  }
`;

export const Header = styled(RawHeader.default)`
  width: 100%;
  line-height: 30px;
  background: ${PanelColors.headerBar};
  border-bottom: ${AppBorders.pageDivider};
  min-height: 48px;
  z-index: 1;
  height: 30px;
`;

export const Logo = styled.img`
  height: 45px;
  cursor: pointer;
  margin-left: -15px;
`;

export const ModeSpan = styled.span`
  font-weight: 500;
`;

export const PreviewRow = styled(({previewType, ...rest}: any) => <Row {...rest} />)`
  background: ${props => getPreviewTheme(Colors.blackPure, props.previewType, 0)};
  margin: 0;
  height: 8px;
  color: ${Colors.blackPure};
  display: flex;
  justify-content: space-between;
`;

export const PageHeaderContainer = styled.div``;

export const ResourceSpan = styled.span`
  font-weight: 700;
`;

export const SettingsCol = styled(Col)`
  display: flex;
  align-items: center;
`;

export const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const EllipsisOutlined = styled(RawEllipsisOutlined)`
  color: ${Colors.blue6};
  font-size: 1rem;
  cursor: pointer;
  margin-left: 1.5rem;
`;

export const BackToProjectButton = styled(RawButton)`
  margin-right: 0px !important;
  padding: 0px;
  font-size: 12px;
  color: ${Colors.blue6};
`;

export const Divider = styled(RawDivider)`
  border-color: ${Colors.grey3};
  height: 28px;
  margin: 0;
`;
