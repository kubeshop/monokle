import React from 'react';
import styled from 'styled-components';
import AntRow, {RowProps as AntRowProps} from 'antd/lib/row/index';
import 'antd/dist/antd.css';

export type RowProps = AntRowProps & {
  noborder?: React.ReactNode;
};

const Row = styled((props: RowProps) => <AntRow {...props}/>)`
  ${props => props.noborder && `
    padding: 1px;
    margin: 0px;
    height: 100%;
  `};
`;

export default Row;
