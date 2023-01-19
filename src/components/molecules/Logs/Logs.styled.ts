import {Typography} from 'antd';

import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

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
  font-size: 14px;
  font-family: 'Inter', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji',
    'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji', -apple-system, BlinkMacSystemFont;
  font-variant: tabular-nums;
  font-style: normal;
  font-weight: 600;
  line-height: 24px;
  color: ${Colors.grey8};
`;
