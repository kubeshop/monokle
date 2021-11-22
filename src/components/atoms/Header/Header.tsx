import React from 'react';

import Layout, {LayoutProps} from 'antd/lib/layout/index';

import styled from 'styled-components';

const AntHeader = Layout.Header;

export type HeaderProps = LayoutProps & {
  noborder?: React.ReactNode;
};

const Header = styled((props: HeaderProps) => <AntHeader {...props} />)`
  ${props =>
    props.noborder &&
    `
    padding: 0px;
    margin: 0px;
  `};
`;

export default Header;
