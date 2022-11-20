import {Typography} from 'antd';

import styled from 'styled-components';

import {FontColors} from '@styles/Colors';

const {Text} = Typography;

const EditorMonoPaneTitle = styled(Text)`
  &.ant-typography {
    white-space: nowrap;
    display: flex;
    justify-content: space-between;
    margin-bottom: 0;
    padding: 8px 16px 8px 16px;
    font-size: 14px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif,
      'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
    font-variant: tabular-nums;
    font-style: normal;
    font-weight: 600;
    line-height: 24px;
    color: ${FontColors.darkThemeMainFont};
  }
`;

export default EditorMonoPaneTitle;
