import {QuestionCircleOutlined as RawQuestionCircleOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

export const Container = styled.div`
  padding: 24px;
`;

export const NotFoundLabel = styled.span`
  color: ${Colors.grey7};
`;

export const ButtonsContainer = styled.div`
  padding: 8px;
  padding-bottom: 12px;
  display: flex;
  justify-content: flex-end;
`;

export const QuestionCircleOutlined = styled(RawQuestionCircleOutlined)`
  cursor: pointer;
  margin-top: 5px;
  padding-right: 5px;
  color: ${Colors.blue6};
`;

export const PluginsContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const PluginColumnContainer = styled.div`
  width: 45%;
`;
