import {Button as RawButton, Divider as RawDivider} from 'antd';

import {ClusterOutlined as RawClusterOutlined, DownOutlined as RawDownOutlined} from '@ant-design/icons';
import {
  CheckCircleOutlined as RawCheckCircleOutlined,
  ExclamationCircleOutlined as RawExclamationCircleOutlined,
} from '@ant-design/icons/lib/icons';

import styled from 'styled-components';

import Colors from '@styles/Colors';

export const Button = styled(RawButton)<{isInClusterMode?: boolean}>`
  margin: 0 0 0 10px;
  border: 1px solid ${props => (props.isInClusterMode ? Colors.volcano : Colors.blue6)};
  color: ${props => (props.isInClusterMode ? Colors.volcano : Colors.blue6)};
  border-radius: 4px !important;
  font-weight: 600;
  font-size: 12px;

  &:hover,
  &:focus {
    opacity: 0.8;
    border: 1px solid ${props => (props.isInClusterMode ? Colors.volcano : Colors.blue6)};
    color: ${props => (props.isInClusterMode ? Colors.volcano : Colors.blue6)};
  }
`;

export const ExitButton = styled(RawButton)<{isInClusterMode?: boolean}>`
  margin: 0 0 0 10px;
  color: ${props => (props.isInClusterMode ? Colors.blackPure : Colors.volcano)};
  background-color: ${props => (props.isInClusterMode ? Colors.volcano : Colors.blackPure)};
  border-radius: 4px !important;
  font-weight: 600;
  font-size: 12px;

  &:hover,
  &:focus {
    color: ${props => (props.isInClusterMode ? Colors.blackPure : Colors.volcano)};
    background-color: ${props => (props.isInClusterMode ? Colors.volcano : Colors.blackPure)};
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

export const ClusterActionText = styled.span<{$highlighted?: boolean}>`
  ${({$highlighted}) => `
    font-size: ${$highlighted ? '9px' : '12px'};
    line-height: ${$highlighted ? '30px' : '20px'};
    color: ${$highlighted ? Colors.whitePure : Colors.blue6};
`}
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
  padding: 0 8px;

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
  font-size: 12px;
  margin-top: 4px;
  margin-right: 4px;
  letter-spacing: 0.05em;
  font-weight: 600;
  line-height: 20px;
  text-transform: uppercase;
`;

export const ClusterStatus = styled.div`
  display: flex;
  align-items: center;
  border-radius: 4px;
  padding: 0px 8px;
  background: ${Colors.grey3b};
`;

export const ClusterStatusText = styled.span<{isKubeConfigPathValid?: Boolean; isInClusterMode?: Boolean}>`
  padding-left: 5px;
  font-size: 14px;
  color: ${props =>
    props.isKubeConfigPathValid ? (props.isInClusterMode ? Colors.volcano : Colors.greenOkay) : Colors.grey8};
`;

export const Divider = styled(RawDivider)`
  border-color: ${Colors.grey3};
  height: 1em;
`;

export const DownOutlined = styled(RawDownOutlined)`
  padding-top: 2px;
`;

export const CheckCircleOutlined = styled(RawCheckCircleOutlined)<{
  isInClusterMode?: Boolean;
  isKubeConfigPathValid?: Boolean;
}>`
  color: ${props =>
    props.isKubeConfigPathValid ? (props.isInClusterMode ? Colors.volcano : Colors.greenOkay) : Colors.grey8};
  font-size: 13px;
  margin-right: 4px;
`;

export const ExclamationCircleOutlinedWarning = styled(RawExclamationCircleOutlined)`
  color: ${Colors.yellowWarning};
  font-size: 13px;
`;
