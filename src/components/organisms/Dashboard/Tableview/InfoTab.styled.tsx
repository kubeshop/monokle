import {Tag} from 'antd';

import styled from 'styled-components';

import Colors from '@styles/Colors';

export const Container = styled.div`
  padding: 24px;
  height: 100%;
  overflow-y: scroll;
`;

export const Row = styled.div`
  margin-bottom: 24px;
`;

export const Title = styled.div`
  color: ${Colors.grey9};
  font-weight: 400;
  font-size: 13px;
  margin-bottom: 2px;
`;

export const BlueContent = styled.div`
  color: ${Colors.blue7};
`;

export const GreyContent = styled.div`
  color: ${Colors.grey7};
`;

export const StatusRunning = styled(Tag)`
  font-size: 12px;
  font-weight: 400;
  color: ${Colors.blue1000};
  background-color: ${Colors.black10};
  border: 1px solid ${Colors.geekblue4};
  border-radius: 2px;
`;

export const StatusActive = styled(Tag)`
  font-size: 12px;
  font-weight: 400;
  color: ${Colors.whitePure};
  background-color: ${Colors.green10};
  border: 1px solid ${Colors.green6};
  border-radius: 2px;
`;

export const StatuTerminating = styled(Tag)`
  font-size: 12px;
  font-weight: 400;
  color: ${Colors.whitePure};
  background-color: ${Colors.redError};
  border: 1px solid ${Colors.red7};
  border-radius: 2px;
`;
