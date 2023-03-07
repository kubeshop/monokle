import styled from 'styled-components';

export const TitleContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
`;

export const Title = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const TitleFilePath = styled.div`
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;
