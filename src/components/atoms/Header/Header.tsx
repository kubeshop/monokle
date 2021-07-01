import React from 'react';
import styled from 'styled-components';
import Layout, {LayoutProps} from 'antd/lib/layout/index';

const AntHeader = Layout.Header;

export type HeaderProps = LayoutProps & {
  noborder?: React.ReactNode;
};

const Header = styled((props: HeaderProps) => <AntHeader {...props}/>)`
  ${props => props.noborder && `
    padding: 0px;
    margin: 0px;
  `};
`;

export default Header;
