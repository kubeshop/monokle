import React from 'react';

import AntDrawer, {DrawerProps as AntDrawerProps} from 'antd/lib/drawer/index';

import styled from 'styled-components';

export type DrawerProps = AntDrawerProps & {
  noborder?: React.ReactNode;
  children?: React.ReactNode;
};

const Drawer = styled((props: DrawerProps) => <AntDrawer {...props} />)`
  ${props =>
    props.noborder &&
    `
    padding: 1px;
    margin: 0px;
    z-index: 100;
  `};
`;

export default Drawer;
