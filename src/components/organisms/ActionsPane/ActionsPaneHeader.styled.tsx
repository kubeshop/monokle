import {Button} from 'antd';

import {EllipsisOutlined as RawEllipsisOutlined} from '@ant-design/icons';

import {rgba} from 'polished';
import styled from 'styled-components';

import Colors from '@styles/Colors';

export const PrimaryButton = styled(Button)`
  border-radius: 4px;
  padding: 0px 14px;
  font-weight: 600;
  border: none;
`;

export const SecondaryButton = styled(Button)`
  border-radius: 4px;
  color: ${Colors.blue6};
  padding: 0px 14px;
  background-color: ${Colors.grey3b};
  border: none;
  font-weight: 600;

  &:hover {
    background-color: ${rgba(Colors.grey3b, 0.8)};
  }
`;

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-left: 8px;

  Button {
    margin: 0 4px;
  }
`;

export const LeftArrowButton = styled(Button)`
  margin-right: 5px;

  & .anticon {
    font-size: 16px;
  }
`;

export const RightArrowButton = styled(Button)`
  margin-right: 10px;

  & .anticon {
    font-size: 16px;
  }
`;

export const SaveButton = styled(Button)`
  margin-right: 8px;
`;

export const EllipsisOutlined = styled(RawEllipsisOutlined)`
  color: ${Colors.blue6};
  font-size: 1rem;
  cursor: pointer;
  margin: 0 0.5rem 0 1.5rem;
`;

export const DropdownActionContainer = styled.div`
  min-width: 84px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  background-color: ${Colors.grey4000};

  button,
  .ant-btn-background-ghost.ant-btn-primary[disabled] {
    border: none;
    background: transparent;
    margin: 0.1rem 0.5rem;
  }
`;
