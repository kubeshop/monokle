import {Button} from 'antd';

import {EllipsisOutlined as RawEllipsisOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import Colors from '@styles/Colors';

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
`;

export const RightArrowButton = styled(Button)`
  margin-right: 10px;
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
