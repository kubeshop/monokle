import {Button, ButtonProps} from 'antd';

import styled from 'styled-components';

import {GlobalScrollbarStyle} from '@utils/scrollbar';

import {AppBorders} from '@styles/Borders';
import Colors, {BackgroundColors} from '@styles/Colors';

export const List = styled.ol<{height: number}>`
  list-style-type: none;
  padding: 0;
  overflow-y: auto;
  ${GlobalScrollbarStyle}
  ${props => `height: ${props.height}px;`}
  padding-bottom: 20px;
`;

export const TitleBar = styled.div`
  display: flex;
  height: 24px;
  justify-content: space-between;
  border-bottom: ${AppBorders.sectionDivider};
  width: 100%;
  height: 40px;
  margin: 0;
  padding: 0;
  background: ${BackgroundColors.darkThemeBackground};
  overflow: hidden;
`;

export const TitleBarRightButtons = styled.div`
  float: right;
  display: flex;
  align-items: center;
  padding-right: 16px;
`;

export const FilterButton = styled(Button)``;

export const FiltersNumber = styled.div`
  margin-left: 5px;
`;

interface PlusItem extends ButtonProps {
  highlighted?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const PlusButton = styled(({highlighted, ...rest}: PlusItem) => <Button {...rest} />)`
  ${({highlighted}) => `
  border-radius: ${highlighted ? '100%' : 'inherit'} !important;
  color: ${highlighted ? Colors.whitePure : Colors.blue6} !important`};
  &:after {
    ${({highlighted}) =>
      `height: ${highlighted ? '24px' : 'inherit'};
      width: ${highlighted ? '24px' : 'inherit'};
      top: ${highlighted ? '-1px' : 'inherit'};
      left: ${highlighted ? '-1px' : 'inherit'}
      `};
  }
`;
