import {Button} from 'antd';

import styled from 'styled-components';

import Colors from '@styles/Colors';

export const FlexContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const StyledButton = styled(Button)<{type?: string}>`
  background: ${props => (props.type === 'primary' ? Colors.whitePure : 'transparent')};
  color: ${props => (props.type === 'primary' ? Colors.blackPure : Colors.whitePure)};
  box-shadow: 0px 2px 0px rgba(0, 0, 0, 0.016);
  border-radius: 2px;
  border: ${props => (props.type === 'primary' ? 'none' : `1px solid ${Colors.whitePure}`)};
  margin-left: 10px;

  &:hover,
  &:focus {
    background: ${Colors.whitePure};
    color: ${Colors.blackPure};
    border: none;
  }
`;

export const CloseButton = styled(Button)`
    border: none;
    outline: none;
    position: absolute;
    top: -18px;
    right: -6px;
    transition: all 0.2s ease-in;

    &:hover, &:focus {
        color: ${Colors.whitePure};
    }
}
`;

export const Description = styled.p`
  margin: 15px 0 30px;
`;
