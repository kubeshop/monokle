import {QuestionCircleOutlined as RawQuestionCircleOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

export const Container = styled.div`
  padding: 30px 4px 24px 4px;
`;

export const NotFoundLabel = styled.span`
  color: ${Colors.grey7};
`;

export const ButtonsContainer = styled.div`
  padding-bottom: 26px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid ${Colors.grey3};
`;

export const QuestionCircleOutlined = styled(RawQuestionCircleOutlined)`
  cursor: pointer;
  align-self: center;
  padding-right: 5px;
  color: ${Colors.blue6};
`;

export const PluginsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 20px;
`;

export const PluginColumnContainer = styled.div`
  width: 45%;
`;
