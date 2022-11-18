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
  color: #000000;
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
  color: #ffffff;
  background-color: ${Colors.geekblue7};
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
