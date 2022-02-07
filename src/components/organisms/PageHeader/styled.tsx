import {
  ApiOutlined as RawApiOutlined,
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
  display: grid;
  grid-template-columns: max-content 1fr max-content;
  align-items: center;
  padding: 0px 15px 0px 10px;
`;

export const BellOutlined = styled(RawBellOutlined)`
  color: ${FontColors.elementSelectTitle};
  font-size: 20px;
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
  background: ${BackgroundColors.darkThemeBackground};
  border-bottom: ${AppBorders.pageDivider};
  min-height: 50px;
  z-index: 1;
  height: 30px;
`;

export const Logo = styled.img`
  height: 24px;
  cursor: pointer;
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

export const PageHeaderContainer = styled.div``;

export const ProjectClusterSelectionContainer = styled.div`
  display: flex;
  justify-content: center;
`;

export const ResourceSpan = styled.span`
  font-weight: 700;
`;

export const SettingsCol = styled(Col)`
  display: grid;
  grid-template-columns: repeat(4, 18px);
  align-items: center;
  grid-column-gap: 16px;
`;

export const SettingsOutlined = styled(RawSettingOutlined)`
  color: ${FontColors.elementSelectTitle};
  font-size: 20px;
  cursor: pointer;
`;

export const ApiOutlined = styled(RawApiOutlined)`
  color: ${FontColors.elementSelectTitle};
  font-size: 20px;
  cursor: pointer;
`;

export const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;
