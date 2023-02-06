import {Button} from 'antd';

import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

export const FilterActionButton = styled(Button)`
  color: ${Colors.cyan8};
  padding: 0 !important;
  margin-right: 18px;
  &:hover {
    background-color: unset;
  }
`;

export const Container = styled.div`
  & > div {
    padding: 0 10px !important;
  }
`;
