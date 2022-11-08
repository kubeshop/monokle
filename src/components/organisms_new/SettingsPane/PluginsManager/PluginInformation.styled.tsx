import {
  AppstoreOutlined as RawAppstoreOutlined,
  DeleteOutlined as RawDeleteOutlined,
  GithubOutlined as RawGithubOutlined,
  QuestionCircleOutlined as RawQuestionCircleOutlined,
} from '@ant-design/icons';

import styled from 'styled-components';

import Colors from '@styles/Colors';

export const AdditionalInformation = styled.div`
  color: ${Colors.grey6};
  line-height: 20px;
  font-size: 12px;
  margin: 6px 0px;
  display: flex;
  flex-direction: column;
`;

export const AppstoreOutlined = styled(RawAppstoreOutlined)`
  font-size: 30px;
  padding-top: 4px;
`;

export const Container = styled.div`
  display: grid;
  grid-template-columns: max-content 1fr;
  grid-column-gap: 18px;
  position: relative;
  margin-bottom: 16px;
`;

export const DeleteOutlined = styled(RawDeleteOutlined)`
  color: ${Colors.red7};
  cursor: pointer;
`;

export const Description = styled.span`
  color: ${Colors.grey7};
`;

export const GithubOutlined = styled(RawGithubOutlined)`
  cursor: pointer;
`;

export const IconsContainer = styled.div`
  display: flex;
  gap: 10px;
`;

export const InfoContainer = styled.span`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const Name = styled.span`
  color: ${Colors.whitePure};
`;

export const NameActionsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr max-content;
  grid-column-gap: 10px;
  align-items: center;
  margin-bottom: 10px;
`;

export const QuestionCircleOutlined = styled(RawQuestionCircleOutlined)`
  cursor: pointer;
  color: ${Colors.blue6};
`;
