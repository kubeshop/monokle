import styled from 'styled-components';

import {AppBorders} from '@shared/styles/borders';

export const Logo = styled.img`
  height: 31px;
`;

export const LogoContainer = styled.div`
  border-right: ${AppBorders.sectionDivider};
  width: 50px;
`;

export const StartPageHeaderContainer = styled.div`
  height: 32px;
  display: flex;
  gap: 20px;
`;
