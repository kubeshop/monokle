import {Input} from 'antd';

import styled from 'styled-components';

import {GlobalScrollbarStyle} from '@utils/scrollbar';

import Colors from '@styles/Colors';

export const Container = styled.div`
  padding: 16px 0px;
`;

export const NotFoundLabel = styled.span`
  margin-left: 16px;
  color: ${Colors.grey7};
`;

export const SearchInput = styled(Input.Search)`
  background: ${Colors.grey1};

  & input::placeholder {
    color: ${Colors.grey7};
  }
`;

export const SearchInputContainer = styled.div`
  margin-bottom: 25px;
  padding: 0px 16px;
`;

export const TemplatesContainer = styled.div<{$height: number}>`
  ${props => `height: ${props.$height}px;`}

  display: grid;
  grid-auto-rows: max-content;
  grid-row-gap: 25px;
  overflow-y: auto;
  padding: 0px 16px 10px 16px;
  ${GlobalScrollbarStyle};
`;
