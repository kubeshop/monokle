import React from 'react';
import styled from 'styled-components';
import {Typography} from 'antd';

const {Title} = Typography;

export type MonoSectionTitleProps =  {};

const MonoSectionTitle = styled((props: MonoSectionTitleProps) => <Title level={5} {...props}/>)`
  &.ant-typography {
    text-transform: uppercase;
    margin-bottom: 0;
  }
`;

export default MonoSectionTitle;
