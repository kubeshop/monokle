import {Skeleton as RawSkeleton} from 'antd';

import styled from 'styled-components';

export const GettingStartedContainer = styled.div`
  height: 100%;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr max-content;
`;

export const PaneManagerContainer = styled.div<{$gridTemplateColumns: string}>`
  display: grid;

  ${({$gridTemplateColumns}) => `grid-template-columns: ${$gridTemplateColumns};`};
`;

export const Skeleton = styled(RawSkeleton)`
  padding: 8px 16px;
`;
