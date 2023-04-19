import {Button} from 'antd';

import {EyeOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

export const ActionButtonsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-direction: row;
  height: 100%;
  position: absolute;
  right: 0;
`;

export const PreviewButton = styled(Button)<{$isItemSelected: boolean}>`
  font-weight: 500;
  font-size: 11px;
  color: ${props => (props.$isItemSelected ? Colors.blackPure : Colors.blue6)}!important;
  margin-left: 5px;
  margin-right: 10px;
`;

export const PreviewIcon = styled(EyeOutlined)<{$isSelected: boolean}>`
  margin-left: 5px;
  color: ${props => (props.$isSelected ? Colors.blackPure : Colors.grey7)};
`;

export const SpinnerContainer = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;

  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  width: 100%;

  @supports (backdrop-filter: blur(10px)) or (--webkit-backdrop-filter: blur(10px)) {
    backdrop-filter: blur(5px);
    --webkit-backdrop-filter: blur(5px);
  }
`;

export const TitleContainer = styled.div<{$actionButtonsWidth: number; $isHovered: boolean}>`
  display: flex;
  align-items: center;
  max-width: ${({$actionButtonsWidth, $isHovered}) => ($isHovered ? `calc(100% - ${$actionButtonsWidth}px)` : '100%')};
  width: ${({$actionButtonsWidth, $isHovered}) => ($isHovered ? `calc(100% - ${$actionButtonsWidth}px)` : '100%')};
`;

export const TitleText = styled.span<{
  $isSelected?: boolean;
  $isHighlighted?: boolean;
  $isExcluded?: boolean;
  $isSupported?: boolean;
}>(props => ({
  overflow: 'hidden',
  position: 'relative',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  paddingRight: '2px',
  color:
    (props.$isSelected && Colors.blackPure) ||
    (props.$isHighlighted && Colors.cyan7) ||
    (props.$isExcluded && Colors.grey7) ||
    (!props.$isSupported && Colors.grey7) ||
    Colors.blue10,
  fontStyle: props.$isExcluded ? `italic` : 'inherit',
  cursor: !props.$isSupported || props.$isExcluded ? 'not-allowed' : 'pointer',
}));

export const NodeContainer = styled.div<{$isDisabled: boolean; $isExcluded: boolean}>`
  position: relative;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: ${({$isDisabled, $isExcluded}) => ($isDisabled || $isExcluded ? 'default' : 'inherit')};
  height: 100%;
`;
