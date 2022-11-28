import styled from 'styled-components';

import {AnimationDurations} from '@styles/Animations';
import Colors from '@styles/Colors';

export const MultipleActions = styled.div`
  display: none;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  padding: 0 10px;
`;

export const ActionCard = styled.div<{$disabled?: boolean; $hasMultipleActions?: boolean}>`
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${Colors.grey11};
  cursor: ${({$disabled}) => ($disabled ? 'not-allowed' : 'pointer')};
  border-radius: 4px;
  color: ${({$disabled}) => ($disabled ? Colors.grey6 : 'inherit')};
  padding: 0px 10px;

  &:hover {
    transition: all ${AnimationDurations.base};
    background-color: ${({$hasMultipleActions}) => ($hasMultipleActions ? Colors.grey11 : Colors.blue7)};

    & > div:nth-child(2) {
      color: ${({$disabled}) => ($disabled ? Colors.grey6 : Colors.whitePure)};
    }

    ${MultipleActions} {
      display: flex;
    }
  }
`;

export const ActionItemDescription = styled.div`
  color: ${Colors.grey7};
`;

export const ActionItemLogo = styled.img`
  width: 4.5rem;
  height: 4.5rem;
  margin-bottom: 20px;
`;

export const ActionItemTitle = styled.div<{$size: 'big' | 'small'}>`
  color: ${Colors.grey9};
  font-size: ${({$size}) => ($size === 'big' ? '16px' : '14px')};
  font-weight: 600;
`;
