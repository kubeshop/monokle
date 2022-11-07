import {Skeleton as RawSkeleton} from 'antd';

import styled from 'styled-components';

export const GettingStartedContainer = styled.div<{$height: number}>`
  height: ${({$height}) => $height}px;
  overflow-y: auto;
`;

export const Skeleton = styled(RawSkeleton)`
  margin: 20px;
  width: 90%;
`;

export const Title = styled.h3`
  font-family: 'Inter';
  font-size: 16px;
  font-weight: 700;
  line-height: 22px;
  letter-spacing: 0em;
  text-align: left;
  margin-left: 40px;
  margin-top: 40px;
  color: #dbdbdb;
`;

export const SubTitle = styled.h6`
  font-family: 'Inter';
  width: 520px;
  height: 44px;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
  margin: 20px 0 0 40px;
  color: #acacac;
`;
