import {Input} from 'antd';

import styled from 'styled-components';

import Colors from '@styles/Colors';

export const Container = styled.div`
  padding: 16px;
`;

export const NotFoundLabel = styled.span`
  color: ${Colors.grey7};
`;

export const SearchInput = styled(Input.Search)`
  background: ${Colors.grey1};
  margin-bottom: 25px;

  & input::placeholder {
    color: ${Colors.grey7};
  }
`;
