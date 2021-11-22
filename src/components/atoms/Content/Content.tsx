import React from 'react';

import Layout, {LayoutProps} from 'antd/lib/layout/index';

import styled from 'styled-components';

const AntContent = Layout.Content;

export type ContentProps = LayoutProps & {
  noborder?: React.ReactNode;
};

const Content = styled((props: ContentProps) => <AntContent {...props} />)`
  ${props =>
    props.noborder &&
    `
    padding: 0px;
    margin: 0px;
  `};
`;

export default Content;
