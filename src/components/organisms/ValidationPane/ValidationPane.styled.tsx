import {Button} from 'antd';

import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

export const BackToDashboardButton = styled(Button)`
  display: block;
  margin-top: 10px;
  border-radius: 4px;
`;

export const DescriptionContainer = styled.div`
  display: grid;
  grid-template-columns: 95px 1fr;
  gap: 20px;
  align-items: center;
  padding: 8px 8px 8px 15px;
`;

export const ErrorMessage = styled.div`
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: ${Colors.grey9};
  font-weight: 600;
`;

export const RevalidateButton = styled(Button)`
  border-radius: 4px;
  width: max-content;
`;

export const ValidationPaneContainer = styled.div`
  padding: 10px 25px 10px 10px;
`;
