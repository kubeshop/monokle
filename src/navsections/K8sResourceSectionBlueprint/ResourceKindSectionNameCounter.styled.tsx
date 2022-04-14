import styled from 'styled-components';

import Colors, {FontColors} from '@styles/Colors';

export const Counter = styled.span<{selected: boolean}>`
  margin-left: 8px;
  font-size: 14px;
  cursor: pointer;
  ${props => (props.selected ? `color: ${Colors.blackPure};` : `color: ${FontColors.grey};`)}
`;

export const WarningCountContainer = styled.span<{selected: boolean; $type: 'warning' | 'error'}>`
  ${({selected, $type}) =>
    `color: ${selected ? Colors.blackPure : $type === 'warning' ? Colors.yellowWarning : Colors.redError};`}
  margin-left: 8px;
  cursor: pointer;
`;
