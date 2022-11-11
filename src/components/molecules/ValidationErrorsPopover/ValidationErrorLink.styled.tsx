import styled from 'styled-components';

import {Colors, FontColors} from '@monokle-desktop/shared/styles/Colors';

export const ErrorMessage = styled.span`
  margin-left: 5px;
  font-style: italic;
  color: ${Colors.redError};
`;

export const PositionText = styled.span`
  margin-left: 5px;
  color: ${FontColors.grey};
`;

export const RefText = styled.span`
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;
