import React from 'react';

import AntCol, {ColProps as AntColProps} from 'antd/lib/col/index';

import styled from 'styled-components';

import {AppBorders} from '@styles/Borders';

export type MonoPaneTitleColProps = AntColProps & {};

const MonoPaneTitleCol = styled((props: MonoPaneTitleColProps) => <AntCol {...props} />)`
  width: 100%;
  margin: 0;
  border-bottom: ${AppBorders.sectionDivider};
`;

export default MonoPaneTitleCol;
