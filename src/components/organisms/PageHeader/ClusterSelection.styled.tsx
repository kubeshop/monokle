import {Button as RawButton, Divider as RawDivider} from 'antd';

import {ClusterOutlined as RawClusterOutlined, DownOutlined as RawDownOutlined} from '@ant-design/icons';
import {
  CheckCircleOutlined as RawCheckCircleOutlined,
  ExclamationCircleOutlined as RawExclamationCircleOutlined,
} from '@ant-design/icons/lib/icons';

import {rgba} from 'polished';
import styled from 'styled-components';

import {PreviewType} from '@models/appstate';

import Colors from '@styles/Colors';

export const Button = styled(RawButton)<{isInPreviewMode?: boolean; previewType?: PreviewType}>`
  margin: 0 0 0 10px;
  border: 1px solid
    ${props =>
      (props.isInPreviewMode && props.previewType === 'cluster' && Colors.volcano) ||
      (props.isInPreviewMode && props.previewType === 'helm' && Colors.cyan) ||
      (props.isInPreviewMode && props.previewType === 'kustomization' && Colors.cyan) ||
      Colors.blue6};
  color: ${props =>
    (props.isInPreviewMode && props.previewType === 'cluster' && Colors.volcano) ||
    (props.isInPreviewMode && props.previewType === 'helm' && Colors.cyan) ||
    (props.isInPreviewMode && props.previewType === 'kustomization' && Colors.cyan) ||
    Colors.blue6};
  border-radius: 4px !important;
  font-weight: 600;
  font-size: 12px;
  letter-spacing: 0.05em;
  background-color: ${Colors.grey11};
  height: 28px;

  &:hover,
  &:focus {
    opacity: 0.8;
    border: 1px solid
      ${props =>
        (props.isInPreviewMode && props.previewType === 'cluster' && Colors.volcano) ||
        (props.isInPreviewMode && props.previewType === 'helm' && Colors.cyan) ||
        (props.isInPreviewMode && props.previewType === 'kustomization' && Colors.cyan) ||
        Colors.blue6};
    color: ${props =>
      (props.isInPreviewMode && props.previewType === 'cluster' && Colors.volcano) ||
      (props.isInPreviewMode && props.previewType === 'helm' && Colors.cyan) ||
      (props.isInPreviewMode && props.previewType === 'kustomization' && Colors.cyan) ||
      Colors.blue6};
  }
`;

export const ExitButton = styled(RawButton)<{isInPreviewMode?: boolean; previewType?: PreviewType}>`
  margin: 0 0 0 10px;
  color: ${props => (props.isInPreviewMode && Colors.grey11) || Colors.whitePure};
  background-color: ${props =>
    (props.isInPreviewMode && props.previewType === 'cluster' && Colors.volcano) ||
    (props.isInPreviewMode && props.previewType === 'helm' && Colors.cyan) ||
    (props.isInPreviewMode && props.previewType === 'kustomization' && Colors.cyan) ||
    Colors.grey11};
  border-radius: 4px !important;
  font-weight: 600;
  font-size: 12px;
  letter-spacing: 0.05em;
  height: 28px;

  &:hover,
  &:focus {
    color: ${props => (props.isInPreviewMode && Colors.grey11) || Colors.whitePure};
    background-color: ${props =>
      (props.isInPreviewMode && props.previewType === 'cluster' && Colors.volcano) ||
      (props.isInPreviewMode && props.previewType === 'helm' && Colors.cyan) ||
      (props.isInPreviewMode && props.previewType === 'kustomization' && Colors.cyan) ||
      Colors.grey11};
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
  max-width: 200px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

export const ClusterAccessContainer = styled.span`
  padding: 5px;
  margin-right: 5px;
  color: ${Colors.grey8} !important;
`;

export const ClusterOutlined = styled(RawClusterOutlined)`
  font-size: 14px;
  margin-right: 8px;
  font-weight: 600;
  text-transform: uppercase;
`;

export const ClusterStatus = styled.div<{isInPreviewMode?: boolean}>`
  display: flex;
  align-items: center;
  border-radius: ${props => (props.isInPreviewMode ? '0 4px 4px 0' : '4px')};
  padding: 0 1rem;
  background: ${Colors.grey3b};
`;

export const ClusterStatusText = styled.span<{
  isKubeConfigPathValid?: Boolean;
  isInPreviewMode?: Boolean;
  previewType?: PreviewType;
}>`
  margin-left: 8px;
  font-weight: 600;
  font-size: 12px;
  color: ${props =>
    (!props.isKubeConfigPathValid && Colors.grey8) ||
    (props.isInPreviewMode && props.previewType === 'cluster' && Colors.volcano) ||
    (props.isInPreviewMode && props.previewType === 'helm' && Colors.cyan) ||
    (props.isInPreviewMode && props.previewType === 'kustomization' && Colors.cyan) ||
    Colors.greenOkay};
`;

export const Divider = styled(RawDivider)`
  border-color: ${Colors.grey3};
  height: 1em;
`;

export const DownOutlined = styled(RawDownOutlined)`
  padding-top: 2px;
`;

export const CheckCircleOutlined = styled(RawCheckCircleOutlined)<{
  isKubeConfigPathValid?: Boolean;
  isInPreviewMode?: Boolean;
  previewType?: PreviewType;
}>`
  color: ${props =>
    (!props.isKubeConfigPathValid && Colors.grey8) ||
    (props.isInPreviewMode && props.previewType === 'cluster' && Colors.volcano) ||
    (props.isInPreviewMode && props.previewType === 'helm' && Colors.cyan) ||
    (props.isInPreviewMode && props.previewType === 'kustomization' && Colors.cyan) ||
    Colors.greenOkay};
  font-size: 14px;
  margin-right: 8px;
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
  color: ${props =>
    (props.previewType === 'cluster' && Colors.volcano) ||
    (props.previewType === 'helm' && Colors.cyan) ||
    (props.previewType === 'kustomization' && Colors.cyan) ||
    Colors.blackPure};
  background-color: ${props =>
    (props.previewType === 'cluster' && rgba(Colors.volcano, 0.2)) ||
    (props.previewType === 'helm' && rgba(Colors.cyan, 0.2)) ||
    (props.previewType === 'kustomization' && rgba(Colors.cyan, 0.2)) ||
    Colors.blackPure};
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.05em;
`;
