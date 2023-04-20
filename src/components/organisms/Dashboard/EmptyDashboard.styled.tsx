import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

export const Container = styled.div`
  display: flex;
  position: relative;
  justify-content: center;
  gap: 10px;
  height: 100%;
  width: 100%;
  background-color: ${Colors.grey3000};
`;

export const Image = styled.img<{$right?: number}>`
  width: 66px;
  min-width: 66px;
`;

export const Text = styled.div`
  align-self: flex-end;
  max-width: 200px;

  & span {
    color: ${Colors.cyan8};
  }
`;
