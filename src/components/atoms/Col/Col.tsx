import React from 'react';

import AntCol, {ColProps as AntColProps} from 'antd/lib/col/index';

import styled from 'styled-components';

export type ColProps = AntColProps & {
  noborder?: React.ReactNode;
};

const Col = styled((props: ColProps) => <AntCol {...props} />)`
  ${props =>
    props.noborder &&
    `
    padding: 1px;
    margin: 0px;
  `};
  height: 100%;
`;

export default Col;
