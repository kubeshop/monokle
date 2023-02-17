import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

export const NodeContainer = styled.div`
  position: relative;
`;

export const NodeTitleContainer = styled.div`
  padding-right: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const NumberOfResources = styled.span`
  margin-left: 12px;
  color: ${Colors.grey7};
`;
