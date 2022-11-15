import {Skeleton as RawSkeleton} from 'antd';

import styled from 'styled-components';

export const GettingStartedContainer = styled.div<{$height: number}>`
  height: 100%;
`;

export const Skeleton = styled(RawSkeleton)`
  margin: 20px;
  width: 90%;
`;
