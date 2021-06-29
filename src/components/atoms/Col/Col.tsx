import React from 'react';
import styled from 'styled-components';
import AntCol, {ColProps as AntColProps} from 'antd/lib/col/index';
import 'antd/dist/antd.css';


export type ColProps = AntColProps & {
  noborder?: React.ReactNode;
};

const Col = styled((props: ColProps) => <AntCol {...props}/>)`
  ${props => props.noborder && `
    padding: 1px;
    margin: 0px;
    height: 100%;
  `};
`;

export default Col;
