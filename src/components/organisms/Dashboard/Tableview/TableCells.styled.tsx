import {Tag} from 'antd';

import styled from 'styled-components';

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
