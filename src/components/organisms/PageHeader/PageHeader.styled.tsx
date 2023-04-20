import {Button, Layout, Button as RawButton, Divider as RawDivider, Row as RawRow} from 'antd';

import {
  BellOutlined as RawBellOutlined,
  EllipsisOutlined as RawEllipsisOutlined,
  MenuOutlined as RawMenuOutlined,
} from '@ant-design/icons';

import styled from 'styled-components';

import {ClusterColors} from '@shared/models/cluster';
import {PreviewType} from '@shared/models/preview';
import {AnimationDurations} from '@shared/styles';
import {Colors, FontColors, PanelColors} from '@shared/styles/colors';

import {getPreviewTheme} from './Controls.styled';

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

export const BellOutlined = styled(RawBellOutlined)`
  color: ${FontColors.elementSelectTitle};
  font-size: 1rem;
  cursor: pointer;
  margin-left: 1.5rem;
`;

export const BranchSelectContainer = styled.div`
  margin-left: 8px;
  padding-top: 1px;
`;

export const EllipsisOutlined = styled(RawEllipsisOutlined)`
  color: ${Colors.blue6};
  font-size: 1rem;
  cursor: pointer;
  margin-left: 1.2rem;
  margin-right: 0.6rem;
  padding: 4px;
`;

export const Header = styled(Layout.Header)`
  width: 100%;
  line-height: 30px;
  background: ${PanelColors.headerBar};
  min-height: 48px;
  z-index: 1;
  height: 30px;
  padding: 0 10px 0px 0px;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;

  & .ant-badge-count-sm {
    font-size: 10px;
    min-width: 12px;
    height: 12px;
    line-height: 12px;
  }

  & .ant-badge-multiple-words {
    padding: 0px 4px 0px 3px;
    right: -3px;
  }
`;

export const InitButton = styled(RawButton)`
  margin-left: 10px;
  margin-right: 6px;
  font-size: 12px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  color: ${Colors.grey7};
`;

export const Logo = styled.img`
  height: 25px;
  cursor: pointer;
`;

export const LogoContainer = styled.div`
  height: 100%;
  min-width: 50px;
  width: 50px;
  display: flex;
  justify-content: center;
`;

export const PreviewRow = styled(RawRow)<{
  $previewType?: PreviewType;
  $kubeConfigContextColor?: ClusterColors;
  $isInClusterMode: boolean;
  $isInPreviewMode: boolean;
}>`
  background: ${props =>
    getPreviewTheme(
      Colors.blackPure,
      props.$previewType,
      0,
      props.$isInPreviewMode,
      props.$isInClusterMode,
      props.$kubeConfigContextColor
    )};
  padding: 0;
  margin: 0;
  height: 8px;
`;

export const PageHeaderContainer = styled.div``;

export const Divider = styled(RawDivider)`
  border-color: ${Colors.grey3};
  height: 28px;
  margin: 0;
  margin-right: 1rem;
  top: 0;
`;

export const ActiveProjectButton = styled(RawButton).attrs({
  type: 'text',
})`
  display: flex;
  align-items: center;
  padding: 0px;
  width: 100%;
  background-color: transparent !important;

  :hover {
    background-color: transparent;

    & span {
      color: ${Colors.geekblue9} !important;
    }
  }
`;

export const ProjectName = styled.span`
  width: 100%;
  max-width: 272px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  color: ${Colors.grey9};
  font-weight: 700;
  font-size: 16px;
  line-height: 20px;
  text-align: left;
  transition: all ${AnimationDurations.fast} ease-in;

  &:disabled {
    color: inherit !important;
  }
`;

export const MenuOutlinedIcon = styled(RawMenuOutlined)`
  color: ${Colors.grey9};
  margin-right: 8px;
  font-size: 20px;
  line-height: 0;
  svg {
    transition: all ${AnimationDurations.slow} ease-in;
  }
`;

export const BackProjectsButton = styled(Button)`
  font-size: 12px;
  color: #ffffff;
  line-height: 20px;
  font-weight: 400;
  border-radius: 4px;
  height: 30px;
  padding-left: 16px;
  padding-right: 16px;
  margin-right: 8px;
`;
