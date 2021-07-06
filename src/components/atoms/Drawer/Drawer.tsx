import React from 'react';
import styled from 'styled-components';
import AntDrawer, {DrawerProps as AntDrawerProps} from 'antd/lib/drawer/index';

export type DrawerProps = AntDrawerProps & {
  noborder?: React.ReactNode;
  children?: React.ReactNode;
};

const Drawer = styled((props: DrawerProps) => <AntDrawer {...props}/>)`
  ${props => props.noborder && `
    padding: 1px;
    margin: 0px;
  `};
`;

export default Drawer;
