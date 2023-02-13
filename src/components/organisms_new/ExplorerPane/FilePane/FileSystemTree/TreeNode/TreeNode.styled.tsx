import {Button} from 'antd';

import {EyeOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

export const ActionButtonsContainer = styled.div`
  display: none;
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

export const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  max-width: 100%;
`;

export const TitleText = styled.span`
  overflow: hidden;
  position: relative;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const NodeContainer = styled.div<{$actionButtonsWidth?: number; $isDisabled: boolean}>`
  position: relative;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: ${({$isDisabled}) => ($isDisabled ? 'default' : 'inherit')};
  height: 100%;

  &:hover {
    ${ActionButtonsContainer} {
      display: flex;
    }

    ${TitleContainer} {
      max-width: ${({$actionButtonsWidth}) => `calc(100% - ${$actionButtonsWidth}px)`};
      width: ${({$actionButtonsWidth}) => `calc(100% - ${$actionButtonsWidth}px)`};
    }
  }
`;
