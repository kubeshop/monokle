import React from 'react';
import styled from 'styled-components';
import AntCol, {ColProps as AntColProps} from 'antd/lib/col/index';
import {AppBorders} from '@styles/Borders';

export type MonoSectionHeaderColProps = AntColProps & {};

const MonoSectionHeaderCol = styled((props: MonoSectionHeaderColProps) => <AntCol {...props} />)`
  width: 100%;
  margin: 0;
  padding: '12px 16px 12px 16px';
  border-top: ${AppBorders.sectionDivider};
`;

export default MonoSectionHeaderCol;
