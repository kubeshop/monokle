import React from 'react';

import Layout, {LayoutProps} from 'antd/lib/layout/index';

import styled from 'styled-components';

const AntFooter = Layout.Footer;

export type FooterProps = LayoutProps & {
  noborder?: React.ReactNode;
};

const Footer = styled((props: FooterProps) => <AntFooter {...props} />)`
  ${props =>
    props.noborder &&
    `
    padding: 0px;
    margin: 0px;
  `};
`;

export default Footer;
