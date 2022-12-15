import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

export const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background: ${Colors.blackPure};
`;

export const Title = styled.p`
  width: auto;
  margin: 0;
  text-align: center;
  margin-top: 1rem;
  color: ${Colors.blue1000};
  font-weight: 700;
  font-size: 1.1rem;
`;

export const Text = styled.p`
  width: auto;
  margin: 0;
  text-align: center;
  margin-top: 0.8rem;
  color: ${Colors.grey7};
  font-size: 0.9rem;
`;

export const InfoLink = styled.a`
  text-decoration: underline;
  color: ${Colors.grey7};
  font-size: 0.7rem;
  :hover {
    opacity: 0.7;
    color: ${Colors.grey7};
    text-decoration: underline;
  }
`;

export const Info = styled.p`
  width: auto;
  margin: 0;
  text-align: center;
  margin-top: 1rem;
  color: ${Colors.grey7};
  font-size: 0.7rem;
`;

export const ImageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 3rem;
`;

export const Image = styled.img`
  width: 80%;
`;
