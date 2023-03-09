import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

export const Container = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: flex-end;
  padding-right: 145px;
  padding-top: 20px;
`;

export const Image = styled.img<{$right?: number}>`
  width: 180px;
  min-width: 180px;
`;

export const Text = styled.div`
  align-self: flex-end;
  max-width: 200px;

  & span {
    color: ${Colors.cyan8};
  }
`;
