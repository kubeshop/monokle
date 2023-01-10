import styled from 'styled-components';

import {AnimationDurations} from '@shared/styles/animations';
import {Colors} from '@shared/styles/colors';

export const ActionsContainer = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  gap: 15px;
`;

export const LastOpened = styled.div`
  font-size: 12px;
  color: ${Colors.grey7};
`;

export const Name = styled.div`
  color: ${Colors.whitePure};
  margin-bottom: 8px;
`;

export const Path = styled.div`
  font-size: 12px;
  color: ${Colors.grey6};
`;

export const ProjectCardContainer = styled.div<{$isActive: boolean}>`
  position: relative;
  min-height: 110px;
  height: 110px;
  cursor: pointer;
  background: #191d1f;
  border-radius: 4px;
  padding: 16px;
  border-left: 4px solid ${props => (props.$isActive ? Colors.blue7 : 'transparent')};
  transition: background ${AnimationDurations.base};

  & .anticon-pushpin {
    color: ${Colors.grey7};
  }

  & .anticon-delete {
    color: ${Colors.red7};
    display: none;
  }

  &:hover {
    background: ${Colors.blue1};

    & .anticon-delete {
      display: block;
    }
  }
`;
