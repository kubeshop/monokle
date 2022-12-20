import styled from 'styled-components';

import {Colors} from '@shared/styles';

export const IconsContainer = styled.div`
  /* Vector */
  width: 54px;
  height: 54px;
  display: flex;
`;

export const ActionBarDiv = styled.div`
  display: inline-flex;
  justify-content: space-between;
  align-items: center;
  padding: 9px 12px;
  width: 100%;
`;

export const ActionBarRightDiv = styled.div`
  display: inline-flex;
  align-items: end;
  width: 305px;
`;

export const Link = styled.a`
  color: ${Colors.blue7};
  display: inline;
`;
