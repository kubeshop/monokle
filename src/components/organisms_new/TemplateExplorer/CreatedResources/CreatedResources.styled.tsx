import {Button, Input} from 'antd';

import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

export const CreatedResourceLabel = styled.p`
  font-weight: 600;
`;

export const CreatedResourceKind = styled.span`
  margin: 0px 15px 0px 5px;
  font-style: italic;
  color: ${Colors.grey7};
`;

export const CreatedResourceName = styled.span`
  margin-left: 10px;
  color: ${Colors.yellow7};
`;
export const Description = styled.div`
  padding: 22px 22px 18px 22px;
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

export const Title = styled.div`
  padding: 5px;
`;
