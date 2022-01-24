import {
  BellOutlined as RawBellOutlined,
  CloseCircleOutlined as RawCloseCircleOutlined,
  CopyOutlined as RawCopyOutlined,
  EditOutlined as RawEditOutlined,
  SettingOutlined as RawSettingOutlined,
} from '@ant-design/icons';

import styled from 'styled-components';

import Col from '@components/atoms/Col';
import * as RawHeader from '@components/atoms/Header';
import * as RawRow from '@components/atoms/Row';

import {AppBorders} from '@styles/Borders';
import Colors, {BackgroundColors, FontColors} from '@styles/Colors';

export const Row = styled(RawRow.default)`
  display: flex;
  justify-content: space-between;
  flex-flow: inherit;
`;

export const BellOutlined = styled(RawBellOutlined)`
  color: ${FontColors.elementSelectTitle};
  font-size: 24px;
  cursor: pointer;
`;

export const CloseCircleOutlined = styled(RawCloseCircleOutlined)`
  margin-right: 5px;
`;

export const ClusterRow = styled(Row)`
  background: ${BackgroundColors.clusterModeBackground};
  margin: 0;
  padding: 0 10px;
  height: 25px;
  color: ${Colors.blackPure};
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
  background: ${BackgroundColors.darkThemeBackground};
  border-bottom: ${AppBorders.pageDivider};
  min-height: 50px;
  z-index: 1;
  height: 30px;
`;

export const IconContainerSpan = styled.span`
  color: ${FontColors.elementSelectTitle};
  padding-top: 10px;
  padding-right: 10px;
  font-size: 24px;
  cursor: pointer;
`;

export const Logo = styled.img`
  height: 24px;
  margin: 4px;
  margin-top: 11px;
`;

export const LogoCol = styled(Col)`
  padding-left: 4px;
  flex: 1;
`;

export const ModeSpan = styled.span`
  font-weight: 500;
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

export const ResourceSpan = styled.span`
  font-weight: 700;
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
