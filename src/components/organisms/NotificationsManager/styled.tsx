import {
  CheckCircleOutlined as RawCheckCircleOutlined,
  ExclamationCircleOutlined as RawExclamationCircleOutlined,
  InfoCircleOutlined as RawInfoCircleOutlined,
} from '@ant-design/icons';

import styled from 'styled-components';

import Colors, {FontColors} from '@styles/Colors';

html{
 font-size : 10px;
}

export const CheckCircleOutlined = styled(RawCheckCircleOutlined)`
  color: ${Colors.polarGreen};
  font-size: 1.6rem;
`;

export const ExclamationCircleOutlined = styled(RawExclamationCircleOutlined)`
  color: ${FontColors.error};
  font-size: 1.6rem;
`;

export const ExclamationCircleOutlinedWarning = styled(RawExclamationCircleOutlined)`
  color: ${Colors.yellowWarning};
  font-size: 1.6rem;
`;

export const InfoCircleOutlined = styled(RawInfoCircleOutlined)`
  color: ${Colors.cyan};
  font-size: 1.6rem;
`;

export const NoNotificationsContainer = styled.div`
  display: flex;
  margin-bottom: 12px;
`;
