import {Typography} from 'antd';

import styled from 'styled-components';

import {Colors} from '@shared/styles';

export const Container = styled.div`
  display: flex;
  align-items: center;
  border-radius: 4px;
  padding: 0 1rem;
  background: ${Colors.grey3b};
  border: none;
  min-width: fit-content;
`;

export const BlueText = styled(Typography.Text)`
  margin-left: 8px;
  color: ${Colors.blue7};
`;
