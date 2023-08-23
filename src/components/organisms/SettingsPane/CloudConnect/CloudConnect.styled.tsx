import {Row as RawRow} from 'antd';

import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

export const Row = styled(RawRow)`
  overflow: hidden;
  padding: 24px;
  background: linear-gradient(94.81deg, rgba(42, 56, 90, 0.4) 7%, rgba(53, 35, 60, 0.4) 101.38%);
`;

export const Heading = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: ${Colors.geekblue8};
`;

export const Subheading = styled.h2`
  font-weight: 700;
  font-size: 14px;
`;

export const Paragraph = styled.p`
  font-size: 12px;
`;
