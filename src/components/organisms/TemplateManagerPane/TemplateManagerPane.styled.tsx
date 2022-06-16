import {Input, Skeleton as RawSkeleton} from 'antd';

import styled from 'styled-components';

import Colors from '@styles/Colors';

export const Container = styled.div``;

export const NotFoundLabel = styled.span`
  margin-left: 16px;
  color: ${Colors.grey7};
`;

export const SearchInput = styled(Input.Search)`
  & input::placeholder {
    color: ${Colors.grey7};
  }
`;

export const SearchInputContainer = styled.div`
  margin: 16px 0px 25px 0px;
  padding: 0px 16px;
`;

export const TemplateManagerPaneContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

export const TemplatesContainer = styled.div<{$height?: number}>`
  ${props => `height: ${props.$height ? `${props.$height}px` : '100%'};`}
  display: grid;
  grid-auto-rows: max-content;
  grid-row-gap: 25px;
  overflow-y: auto;
  padding: 0px 16px 10px 16px;
`;

export const Skeleton = styled(RawSkeleton)`
  padding: 8px;
`;
