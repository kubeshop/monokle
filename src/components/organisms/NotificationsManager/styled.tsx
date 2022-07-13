import {
  CheckCircleOutlined as RawCheckCircleOutlined,
  ExclamationCircleOutlined as RawExclamationCircleOutlined,
  InfoCircleOutlined as RawInfoCircleOutlined,
} from '@ant-design/icons';

import styled from 'styled-components';

import Colors, {FontColors} from '@styles/Colors';

export const CheckCircleOutlined = styled(RawCheckCircleOutlined)`
  color: ${Colors.polarGreen};
  font-size: 16px;
`;

export const ExclamationCircleOutlined = styled(RawExclamationCircleOutlined)`
  color: ${FontColors.error};
  font-size: 16px;
`;

export const ExclamationCircleOutlinedWarning = styled(RawExclamationCircleOutlined)`
  color: ${Colors.yellowWarning};
  font-size: 16px;
`;

export const InfoCircleOutlined = styled(RawInfoCircleOutlined)`
  color: ${Colors.cyan};
  font-size: 16px;
`;

export const NoNotificationsContainer = styled.div`
  display: flex;
  margin-bottom: 12px;
`;
