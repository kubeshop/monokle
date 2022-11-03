import {Skeleton as RawSkeleton} from 'antd';

import styled from 'styled-components';

export const Skeleton = styled(RawSkeleton)`
  margin: 20px;
  width: 90%;
`;

export const Title = styled.span`
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  padding-right: 10px;
`;
