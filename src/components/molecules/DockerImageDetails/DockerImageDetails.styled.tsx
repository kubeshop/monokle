import styled from 'styled-components';

import {AppBorders} from '@styles/Borders';
import Colors from '@styles/Colors';

export const ImageName = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: ${Colors.cyan7};
  border-bottom: ${AppBorders.sectionDivider};
  padding: 10px;

  display: flex;
  align-items: center;
  gap: 10px;
`;
