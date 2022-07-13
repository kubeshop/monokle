import {Layout, Button as RawButton, Divider as RawDivider, Row as RawRow} from 'antd';

import {BellOutlined as RawBellOutlined, EllipsisOutlined as RawEllipsisOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {PreviewType} from '@models/appstate';
import {ClusterColors} from '@models/cluster';

import {AppBorders} from '@styles/Borders';
import Colors, {FontColors, PanelColors} from '@styles/Colors';

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

export const BackToProjectButton = styled(RawButton)`
  margin-right: 0px !important;
  padding: 0px;
  font-size: 12px;
  color: ${Colors.blue6};
`;

export const BellOutlined = styled(RawBellOutlined)`
  color: ${FontColors.elementSelectTitle};
  font-size: 1rem;
  cursor: pointer;
  margin-left: 1.5rem;
`;

export const EllipsisOutlined = styled(RawEllipsisOutlined)`
  color: ${Colors.blue6};
  font-size: 1rem;
  cursor: pointer;
  margin-left: 1.5rem;
`;

export const Header = styled(Layout.Header)`
  width: 100%;
  line-height: 30px;
  background: ${PanelColors.headerBar};
  border-bottom: ${AppBorders.pageDivider};
  min-height: 48px;
  z-index: 1;
  height: 30px;
  padding: 0 10px;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const Logo = styled.img`
  height: 45px;
  cursor: pointer;
  margin-left: -15px;
`;

export const PreviewRow = styled(RawRow)<{$previewType?: PreviewType; $kubeConfigContextColor?: ClusterColors}>`
  background: ${props => getPreviewTheme(Colors.blackPure, props.$previewType, 0, true, props.$kubeConfigContextColor)};
  padding: 0;
  margin: 0;
  height: 8px;
`;

export const PageHeaderContainer = styled.div``;

export const Divider = styled(RawDivider)`
  border-color: ${Colors.grey3};
  height: 28px;
  margin: 0;
`;
