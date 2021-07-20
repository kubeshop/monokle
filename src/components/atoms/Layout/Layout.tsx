import React from 'react';
import styled from 'styled-components';
import AntLayout, {LayoutProps as AntLayoutProps} from 'antd/lib/layout/index';

export type LayoutProps = AntLayoutProps & {
  mainHeight?: React.ReactNode;
};

const Layout = styled((props: LayoutProps) => <AntLayout {...props} />)`
  width: 100%;
  ${props => props.mainHeight && `height: ${props.mainHeight}`};
`;

export default Layout;
