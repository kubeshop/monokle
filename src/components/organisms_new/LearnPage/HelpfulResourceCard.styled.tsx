import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

export const Description = styled.div`
  color: ${Colors.grey8};
`;

export const HelpfulResourceCardContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-color: #191f21;
  border-radius: 4px;
  padding: 0px 20px;
`;

export const Title = styled.div`
  margin-bottom: 2px;
  color: ${Colors.blue7};
  cursor: pointer;
  transition: all 0.2s ease-in;
  width: max-content;

  &:hover {
    color: ${Colors.blue6};
  }
`;
