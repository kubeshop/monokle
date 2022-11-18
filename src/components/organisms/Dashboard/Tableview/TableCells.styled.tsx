import {Tag} from 'antd';

import styled from 'styled-components';

import Colors from '@styles/Colors';

export const StatusCell = styled(Tag)`
  font-size: 12px;
  font-weight: 400;
  color: #7f9ef3;
  background-color: #131629;
  border: 1px solid #203175;
  border-radius: 2px;
`;

export const NodeCell = styled.div`
  color: #177ddc;
  :hover {
    text-decoration: underline;
  }
`;

export const ErrorCell = styled.div`
  color: #ffffff;
  background-color: ${Colors.red7};
  font-weight: 700;
  font-size: 11px;
  border-radius: 100%;
  width: 16px;
  height: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  letter-spacing: -2px;
  padding: 0 3px 0 0;
`;

export const Warning = styled.span`
  color: #000000;
  background-color: ${Colors.yellow12};
  font-weight: 700;
  font-size: 11px;
  border-radius: 100%;
  width: 16px;
  height: 16px;
  letter-spacing: -1px;
  display: flex;
  justify-content: center;
  align-items: center;
  letter-spacing: -2px;
  padding: 0 3px 0 0;
`;
