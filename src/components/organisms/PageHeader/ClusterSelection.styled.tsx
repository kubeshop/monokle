import {Button as RawButton} from 'antd';

import {ClusterOutlined as RawClusterOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import Colors from '@styles/Colors';

export const Button = styled(RawButton)`
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

export const ClusterActionButton = styled(RawButton)`
  border: none;
  outline: none;
  padding: 0px;
  color: ${Colors.blue6};
  font-size: 12px;
`;

export const ClusterActionText = styled.span<{$highlighted?: boolean}>`
  ${({$highlighted}) => `
    font-size: ${$highlighted ? '8px' : '12px'};
    line-height: ${$highlighted ? '32px' : '20px'};
    color: ${$highlighted ? Colors.whitePure : Colors.blue6};
`}
`;

export const ClusterButton = styled(RawButton)`
  border: none;
  outline: none;
  padding: 0px 8px;
`;

export const ClusterContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 4;
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
  border: 1px solid ${Colors.grey3};
  border-radius: 4px;
  padding: 0px 8px;
  display: flex;
`;

export const ClusterStatusText = styled.span<{connected: Boolean}>`
  font-size: 10px;
  font-weight: 600;
  border-right: 1px solid ${Colors.grey3};
  padding-right: 8px;
  text-transform: uppercase;
  ${props => `color: ${props.connected ? Colors.greenOkayCompliment : Colors.grey7}`};
`;
