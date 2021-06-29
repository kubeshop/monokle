import React from 'react';
import styled from 'styled-components';
import AntLayout, {LayoutProps as AntLayoutProps} from 'antd/lib/layout/index';
import 'antd/dist/antd.css';


export type LayoutProps = AntLayoutProps & {
  mainheight?: React.ReactNode;
  isPageContainer?: React.ReactNode;
};

const Layout = styled((props: LayoutProps) => <AntLayout {...props}/>)`
  width: 100%;
  ${props => props.mainheight && `height: ${props.mainheight}`};
  ${props => props.isPageContainer && `
    padding: 0px;
    overflow-y: clip;
  `};
`;

export default Layout;
