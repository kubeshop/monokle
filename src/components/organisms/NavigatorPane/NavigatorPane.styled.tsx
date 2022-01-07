import {Button} from 'antd';

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

export const PlusButton = styled((props: any) => <Button {...props} />)`
  ${props => `border-radius: ${props.highlighted ? '100%' : 'inherit'} !important`};
  ${props => `color: ${props.highlighted ? Colors.whitePure : Colors.blue6} !important`};
  &:after {
    ${props => `height: ${props.highlighted ? '24px' : 'inherit'}`};
    ${props => `width: ${props.highlighted ? '24px' : 'inherit'}`};
    ${props => `top: ${props.highlighted ? '-1px' : 'inherit'}`};
    ${props => `left: ${props.highlighted ? '-1px' : 'inherit'}`};
  }
`;
