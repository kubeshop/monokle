import {Typography} from 'antd';

import styled from 'styled-components';

import Colors from '@styles/Colors';

const {Text} = Typography;

export const LogContainer = styled.div`
  padding: 0 10px;
  height: 100%;
  overflow-y: auto;
`;

export const LogText = styled(Text)`
  display: block;
  margin-bottom: 0;
  padding: 4px;
  font-size: 13px;
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans',
    sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
  font-variant: tabular-nums;
  font-style: normal;
  font-weight: 600;
  line-height: 28px;
  color: ${Colors.grey8};
`;
