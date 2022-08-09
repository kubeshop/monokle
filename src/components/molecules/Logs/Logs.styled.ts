import {Typography} from 'antd';

import styled from 'styled-components';

import Colors from '@styles/Colors';

const {Text} = Typography;

export const LogContainer = styled.div`
  margin: 0 20px;
`;

export const LogText = styled(Text)`
    display: block;
    margin-bottom: 0;
    padding: 4px;
    font-size: 14px;
    font-family: '-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif,
      'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';'
    font-variant: tabular-nums;
    font-style: normal;
    font-weight: 600;
    line-height: 24px;
    color: ${Colors.grey8};
`;
