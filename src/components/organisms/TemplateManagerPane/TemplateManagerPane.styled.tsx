import {Input} from 'antd';

import styled from 'styled-components';

import {GlobalScrollbarStyle} from '@utils/scrollbar';

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

export const TemplatesContainer = styled.div<{$height: number}>`
  display: grid;
  grid-auto-rows: max-content;
  grid-row-gap: 25px;
  ${props => `height: ${props.$height}px;`}
  overflow-y: auto;
  ${GlobalScrollbarStyle};
`;
