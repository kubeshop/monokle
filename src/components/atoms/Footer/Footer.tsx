import React from 'react';
import styled from 'styled-components';
import Layout, {LayoutProps} from 'antd/lib/layout/index';

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
