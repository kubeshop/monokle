import {Button} from 'antd';

import styled from 'styled-components';

import Colors from '@styles/Colors';

export const Container = styled.div`
  padding: 8px;
`;

export const Title = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const TitleLabel = styled.span`
  color: ${Colors.grey7};
`;

export const TitleButton = styled(Button)`
  padding: 0;
`;

export const Field = styled.div`
  margin-top: 5px;
  margin-bottom: 10px;
`;

export const FieldLabel = styled.p`
  font-weight: 500;
  margin-bottom: 5px;
`;
