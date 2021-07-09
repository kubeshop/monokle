import React from 'react';
import styled from 'styled-components';
import AntCol, {ColProps as AntColProps} from 'antd/lib/col/index';
import { AppBorders } from '@styles/Borders';

export type MonoPaneTitleColProps = AntColProps & {};

const MonoPaneTitleCol = styled((props: MonoPaneTitleColProps) => <AntCol
  {...props}
/>)`
  width: 100%;
  margin: 0;
  padding: '12px 16px 12px 16px';
  border-bottom: ${AppBorders.sectionDivider};
  line-height: 20px;
`;

export default MonoPaneTitleCol;
