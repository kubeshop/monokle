import {Tag} from 'antd';

import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

export const StatusRunning = styled(Tag)`
  font-size: 12px;
  font-weight: 400;
  color: ${Colors.blue1000};
  background-color: ${Colors.black10};
  border: 1px solid ${Colors.geekblue4};
  border-radius: 2px;
`;

export const StatusPending = styled(Tag)`
  font-size: 12px;
  font-weight: 400;
  color: ${Colors.yellow12};
  background-color: ${Colors.yellow1000};
  border: 1px solid ${Colors.yellow100};
  border-radius: 2px;
`;

export const StatusActive = styled(Tag)`
  font-size: 12px;
  font-weight: 400;
  color: ${Colors.green6};
  background-color: ${Colors.green200};
  border: 1px solid ${Colors.green100};
  border-radius: 2px;
`;

export const StatusTerminating = styled(Tag)`
  font-size: 12px;
  font-weight: 400;
  color: ${Colors.errorBg};
  background-color: ${Colors.red100};
  border: 1px solid ${Colors.red10};
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
  border-radius: 8px;
  width: auto;
  height: 18px;
  display: flex;
  justify-content: center;
  align-items: center;
  letter-spacing: -1px;
  padding: 0 4px 0 2px;
`;

export const Warning = styled.span`
  color: ${Colors.blackPure};
  background-color: ${Colors.yellow12};
  font-weight: 700;
  font-size: 10px;
  border-radius: 8px;
  width: auto;
  height: 18px;
  display: flex;
  justify-content: center;
  align-items: center;
  letter-spacing: -1px;
  padding: 0 4px 0 2px;
`;

export const Resource = styled.span`
  color: ${Colors.grey7};
  font-weight: 700;
  font-size: 12px;
  border-radius: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  letter-spacing: -1px;
  margin-left: 4px;
  margin-right: 8px;
`;
