import {Tag} from 'antd';

import styled from 'styled-components';

import Colors from '@styles/Colors';

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

export const NodeCell = styled.div`
  color: ${Colors.blue7};
  :hover {
    text-decoration: underline;
  }
`;

export const ErrorCell = styled.div`
  color: ${Colors.whitePure};
  background-color: ${Colors.red7};
  font-weight: 700;
  font-size: 10px;
  border-radius: 100%;
  width: 18px;
  height: 18px;
  display: flex;
  justify-content: center;
  align-items: center;
  letter-spacing: -1px;
  padding: 0 2px 0 0;
`;

export const Warning = styled.span`
  color: ${Colors.blackPure};
  background-color: ${Colors.yellow12};
  font-weight: 700;
  font-size: 10px;
  border-radius: 100%;
  width: 18px;
  height: 18px;
  display: flex;
  justify-content: center;
  align-items: center;
  letter-spacing: -1px;
  padding: 0 2px 0 0;
`;

export const Resource = styled.span`
  color: ${Colors.grey6};
  font-weight: 700;
  font-size: 12px;
  border-radius: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  letter-spacing: -1px;
`;
