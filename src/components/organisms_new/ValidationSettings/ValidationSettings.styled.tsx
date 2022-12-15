import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

export const ValidationSettingsContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 25px;
`;

export const ValidationSettingsTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: ${Colors.whitePure};
`;
