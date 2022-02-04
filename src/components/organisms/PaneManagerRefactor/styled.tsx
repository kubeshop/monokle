import {Skeleton as RawSkeleton} from 'antd';

import styled from 'styled-components';

export const PaneManagerContainer = styled.div<{$gridTemplateColumns: string}>`
  display: grid;

  ${({$gridTemplateColumns}) => `grid-template-columns: ${$gridTemplateColumns};`};
`;

export const Skeleton = styled(RawSkeleton)`
  padding: 8px 16px;
`;
