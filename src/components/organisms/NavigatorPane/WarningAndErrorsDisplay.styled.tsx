import {Menu} from 'antd';

import styled from 'styled-components';

import {Icon as RawIcon} from '@components/atoms';

import Colors from '@styles/Colors';

export const ErrorWarningContainer = styled.div<{$type: 'warning' | 'error'}>`
  ${({$type}) => `color: ${$type === 'warning' ? Colors.yellowWarning : Colors.redError};`}
  margin-left: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
`;

export const Label = styled.span`
  margin-left: 5px;
`;

export const Icon = styled(RawIcon)<{$type: 'warning' | 'error'}>`
  ${({$type}) => {
    if ($type === 'error') {
      return `
      transform: translateY(-1.5px);
    `;
    }
  }}
`;

export const StyledMenu = styled(Menu)`
  max-height: 400px;
  padding: 4px 0;
  border-right: none;
  overflow-y: scroll;
`;

export const StyledMenuItem = styled(Menu.Item)`
  margin-bottom: 0 !important;
  margin-top: 0 !important;
  height: 32px !important;
  line-height: 32px !important;
  padding: 0px 4px;
`;

export const WarningCountContainer = styled.span<{$type: 'warning' | 'error'}>`
  ${({$type}) => `color: ${$type === 'warning' ? Colors.yellowWarning : Colors.redError};`}
  margin-left: 8px;
  cursor: pointer;
`;

export const WarningKindLabel = styled.span`
  margin-left: 8px;
  font-style: italic;
  color: ${Colors.grey7};
`;
