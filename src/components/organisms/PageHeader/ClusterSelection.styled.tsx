import {Button as RawButton, Divider as RawDivider} from 'antd';

import {ClusterOutlined as RawClusterOutlined, DownOutlined as RawDownOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import Colors from '@styles/Colors';
import {
  CheckCircleOutlined as RawCheckCircleOutlined,
  ExclamationCircleOutlined as RawExclamationCircleOutlined
} from '@ant-design/icons/lib/icons';

export const Button = styled(RawButton)`
  padding: 0;
  margin: 0;
  color: ${Colors.blue6};

  &:hover {
    color: ${Colors.blue6};
    opacity: 0.8;
  }
`;

export const ClusterActionButton = styled(RawButton)`
  padding: 0px;

  margin-left: 5px;
  margin-right: 8px;

  color: ${Colors.blue6};
  font-size: 12px;
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
  align-items: center;
  justify-content: center;

  & .ant-btn[disabled] {
    background: transparent !important;
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
`;

export const ClusterOutlined = styled(RawClusterOutlined)`
  font-size: 10px;
  margin-right: 4px;
  letter-spacing: 0.05em;
  font-weight: 600;
  line-height: 20px;
  text-transform: uppercase;
`;

export const ClusterStatus = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid ${Colors.grey3};
  border-radius: 4px;
  padding: 0px 8px;
`;

export const ClusterStatusText = styled.span<{connected: Boolean}>`
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  ${props => `color: ${props.connected ? Colors.greenOkayCompliment : Colors.grey7}`};
`;

export const Divider = styled(RawDivider)`
  border-color: ${Colors.grey3};
  height: 1em;
`;

export const DownOutlined = styled(RawDownOutlined)`
  padding-top: 2px;
`;

export const CheckCircleOutlined = styled(RawCheckCircleOutlined)`
  color: ${Colors.greenOkay};
  font-size: 13px;
`;

export const ExclamationCircleOutlinedWarning = styled(RawExclamationCircleOutlined)`
  color: ${Colors.yellowWarning};
  font-size: 13px;
`;
