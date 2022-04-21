import {Typography} from 'antd';

import styled from 'styled-components';

import Colors, {FontColors} from '@styles/Colors';

const {Text} = Typography;

export const DrawerTitle = styled(props => <Text {...props} />)`
  &.ant-typography {
    white-space: nowrap;
    display: flex;
    justify-content: space-between;
    margin-bottom: 0;
    text-transform: uppercase;
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

export const ArrowIcon = styled.span`
  display: flex !important;
  align-items: center;

  &: after {
    right: 3px;
    top: 50%;
    content: '';
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 4px 4px 4px 0;
    border-color: transparent ${Colors.whitePure} transparent;
  }
`;

export const DrawerHeadingContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;
