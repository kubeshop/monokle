import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 300px;
  min-width: 300px;
  margin: 45px auto 0px auto;
`;

export const Image = styled.img`
  width: 300px;
  min-width: 300px;
  height: 245px;
  min-height: 245px;
`;

export const Text = styled.div`
  max-width: 300px;
  text-align: center;
  color: ${Colors.grey7};
  font-weight: 600;
`;
