import {Button, Input} from 'antd';

import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

export const CreatedResourceLabel = styled.p`
  font-weight: 600;
`;

export const CreatedResourceKind = styled.span`
  margin-left: 10px;
  font-style: italic;
`;

export const CreatedResourceName = styled.span`
  margin-left: 10px;
  color: ${Colors.yellow7};
`;

export const DoneButton = styled(Button)`
  margin-top: 25px;
`;

export const TextArea = styled(Input.TextArea)`
  margin-top: 20px;
  width: 100%;

  &::-webkit-scrollbar {
    width: 0;
    background: transparent;
  }
`;
