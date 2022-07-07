/* eslint-disable @typescript-eslint/no-unused-vars */
import {ButtonProps, Button as RawButton, Divider as RawDivider} from 'antd';

import {ClusterOutlined as RawClusterOutlined, DownOutlined as RawDownOutlined} from '@ant-design/icons';
import {
  CheckCircleOutlined as RawCheckCircleOutlined,
  ExclamationCircleOutlined as RawExclamationCircleOutlined,
} from '@ant-design/icons/lib/icons';

import {isBoolean} from 'lodash';
import {rgba} from 'polished';
import styled from 'styled-components';

import {PreviewType} from '@models/appstate';

import Colors from '@styles/Colors';

interface RawButtonProps extends ButtonProps {
  isInPreviewMode?: boolean;
  previewType?: PreviewType;
}
interface IAntdIconProps extends React.RefAttributes<HTMLSpanElement> {
  isInPreviewMode?: boolean;
  previewType?: PreviewType;
  isKubeConfigPathValid?: boolean;
}

export const getPreviewTheme = (
  fallBackColor: string,
  previewType?: PreviewType,
  rgbaRatio?: number,
  isInPreviewMode?: boolean
) => {
  let color = fallBackColor;

  if (previewType === 'cluster') {
    color = rgbaRatio ? rgba(Colors.volcano, rgbaRatio) : Colors.volcano;
  }
  if (previewType === 'helm') {
    color = rgbaRatio ? rgba(Colors.cyan, rgbaRatio) : Colors.yellow5;
  }
  if (previewType === 'helm-preview-config') {
    color = rgbaRatio ? rgba(Colors.cyan, rgbaRatio) : Colors.yellow5;
  }
  if (previewType === 'kustomization') {
    color = rgbaRatio ? rgba(Colors.cyan, rgbaRatio) : Colors.cyan;
  }

  return isBoolean(isInPreviewMode) ? (isInPreviewMode ? color : fallBackColor) : color;
};

export const Button = styled(({children, previewType, isInPreviewMode, ...rest}: RawButtonProps) => (
  <RawButton {...rest}>{children}</RawButton>
))`
  margin: 0 0 0 10px;
  border: 1px solid ${props => getPreviewTheme(Colors.greenOkay, props.previewType, 0, props.isInPreviewMode)};
  color: ${props => getPreviewTheme(Colors.greenOkay, props.previewType, 0, props.isInPreviewMode)};
  border-radius: 4px !important;
  font-weight: 600;
  font-size: 12px;
  letter-spacing: 0.05em;
  background-color: ${Colors.grey11};
  height: 28px !important;
  min-width: 28px !important;

  &:hover,
  &:focus {
    opacity: 0.8;
    border: 1px solid ${props => getPreviewTheme(Colors.greenOkay, props.previewType, 0, props.isInPreviewMode)};
    color: ${props => getPreviewTheme(Colors.greenOkay, props.previewType, 0, props.isInPreviewMode)};
  }
`;

export const ExitButton = styled(({children, previewType, isInPreviewMode, ...rest}: RawButtonProps) => (
  <RawButton {...rest}>{children}</RawButton>
))`
  margin: 0 0 0 10px;
  color: ${props => (props.isInPreviewMode && Colors.grey11) || Colors.whitePure};
  background-color: ${props => getPreviewTheme(Colors.grey11, props.previewType, 0, props.isInPreviewMode)};
  border-radius: 4px !important;
  font-weight: 600;
  font-size: 12px;
  letter-spacing: 0.05em;
  height: 28px;

  &:hover,
  &:focus {
    color: ${props => (props.isInPreviewMode && Colors.grey11) || Colors.whitePure};
    background-color: ${props => getPreviewTheme(Colors.grey11, props.previewType, 0, props.isInPreviewMode)};
    opacity: 0.8;
  }
`;

export const ClusterActionButton = styled(RawButton)`
  padding: 0px;
  margin-left: 5px;
  margin-right: 8px;
  font-weight: 400;
  font-size: 12px;
  color: ${Colors.blue7};
`;

export const ClusterButton = styled(RawButton)`
  display: flex;
  align-items: center;
  color: ${Colors.whitePure};
  padding: 0px;

  :hover,
  :focus {
    color: ${Colors.lightSeaGreen};
  }
`;

export const ClusterContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  border-radius: 4px;
  line-height: 28px !important;

  & .ant-btn[disabled] {
    background: transparent !important;
  }
`;

export const ClusterDropdownContainer = styled.div`
  background-color: ${Colors.grey1};
  padding: 10px;
  margin-bottom: 5px;
`;

export const ClusterDropdownClusterName = styled.div`
  cursor: pointer;
  padding: 5px;
  &:hover {
    background-color: ${Colors.grey3};
  }
`;

export const ClusterContextName = styled.span`
  max-width: 100px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

export const ClusterAccessContainer = styled.span`
  color: ${Colors.grey8} !important;
`;

export const ClusterOutlined = styled(RawClusterOutlined)`
  font-size: 14px;
  margin-right: 8px;
  font-weight: 600;
  text-transform: uppercase;
`;

export const ClusterStatus = styled.div<{isHalfBordered?: boolean}>`
  display: flex;
  align-items: center;
  border-radius: ${props => (props.isHalfBordered ? '0 4px 4px 0' : '4px')};
  padding: 0 1rem;
  background: ${Colors.grey3b};
  border: 1px solid ${Colors.grey6};
`;

export const ClusterStatusText = styled.span<{
  isKubeConfigPathValid?: boolean;
  isInPreviewMode?: boolean;
  previewType?: PreviewType;
}>`
  margin-left: 8px;
  font-weight: 600;
  font-size: 12px;
  color: ${props =>
    (!props.isKubeConfigPathValid && Colors.grey8) ||
    getPreviewTheme(Colors.greenOkay, props.previewType, 0, props.isInPreviewMode)};
`;

export const Divider = styled(RawDivider)`
  border-color: ${Colors.grey3};
  height: 1em;
`;

export const DownOutlined = styled(RawDownOutlined)`
  padding-top: 2px;
`;

export const CheckCircleOutlined = styled(
  ({isKubeConfigPathValid, previewType, isInPreviewMode, ...props}: IAntdIconProps) => (
    <RawCheckCircleOutlined {...props} />
  )
)`
  color: ${props =>
    (!props.isKubeConfigPathValid && Colors.grey8) ||
    getPreviewTheme(Colors.greenOkay, props.previewType, 0, props.isInPreviewMode)};
  font-size: 14px;
`;

export const ExclamationCircleOutlinedWarning = styled(RawExclamationCircleOutlined)`
  color: ${Colors.yellowWarning};
  font-size: 13px;
`;

export const PreviewMode = styled.div<{
  previewType?: PreviewType;
}>`
  border-radius: 4px 0 0 4px;
  padding: 0 0.5rem;
  color: ${props => getPreviewTheme(Colors.blackPure, props.previewType, 0)};
  background-color: ${props => getPreviewTheme(Colors.blackPure, props.previewType, 0.2)};
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.05em;
`;
