import {Skeleton as RawSkeleton} from 'antd';

import styled from 'styled-components';

import {Colors} from '@shared/styles';

export const PaneManagerContainer = styled.div<{$gridTemplateColumns: string}>`
  display: grid;

  ${({$gridTemplateColumns}) => `grid-template-columns: ${$gridTemplateColumns};`};

  background-color: ${Colors.black100};
`;

export const Skeleton = styled(RawSkeleton)`
  padding: 8px 16px;
`;
