import {QuestionCircleOutlined as RawQuestionCircleOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {Colors} from '@monokle-desktop/shared/styles/colors';

export const Container = styled.div`
  padding: 24px;
`;

export const NotFoundLabel = styled.span`
  color: ${Colors.grey7};
`;

export const ButtonsContainer = styled.div`
  padding: 24px;
  padding-bottom: 12px;
  margin-top: 8px;
  display: flex;
  justify-content: flex-end;
`;

export const QuestionCircleOutlined = styled(RawQuestionCircleOutlined)`
  cursor: pointer;
  margin-top: 5px;
  padding-right: 5px;
  color: ${Colors.blue6};
`;
