import {Space} from 'antd';

import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

export const Container = styled(Space)`
  max-height: 160px;
  overflow-y: auto;
  padding-right: 8px;
`;

export const Line = styled.span`
  color: ${Colors.whitePure};
`;

export const Message = styled.span`
  color: ${Colors.grey7};
`;
