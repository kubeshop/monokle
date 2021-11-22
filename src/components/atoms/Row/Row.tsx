import React from 'react';

import AntRow, {RowProps as AntRowProps} from 'antd/lib/row/index';

import styled from 'styled-components';

export type RowProps = AntRowProps & {
  noborder?: React.ReactNode;
  elementheight?: React.ReactNode;
};

const Row = styled((props: RowProps) => <AntRow {...props} />)`
  ${props =>
    props.noborder &&
    `
    padding: 1px;
    margin: 0px;
  `};
  height: ${props => props.elementheight || '100%'};
`;

export default Row;
