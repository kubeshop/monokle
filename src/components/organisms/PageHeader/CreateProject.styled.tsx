import {Button as RawButton, Menu as RawMenu} from 'antd';

import styled from 'styled-components';

import {Colors} from '@monokle-desktop/shared/styles';

export const Button = styled(RawButton)`
  display: flex;
  align-items: center;
  padding: 5px;
  width: 100%;

  :hover,
  :focus {
    color: ${Colors.lightSeaGreen};
  }
`;

export const DropdownContainer = styled.div`
  display: flex;
  align-items: center;
  border: none;
  border-radius: 4px;
  height: 28px;
  width: 28px;
  background: ${Colors.grey3b};
  margin-left: 10px;
`;

export const Menu = styled(RawMenu)`
  background: ${Colors.blue7};
  padding: 0px;

  & li {
    border-bottom: 1px solid ${Colors.grey5b};
    font-weight: bold;
    padding: 8px 12px;
    color: ${Colors.whitePure};

    &:last-child {
      border-bottom: none;
    }
  }
`;
