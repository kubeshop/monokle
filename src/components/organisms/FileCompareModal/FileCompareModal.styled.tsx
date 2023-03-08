import styled from 'styled-components';

export const CompareTo = styled.div`
  margin-right: 20px;
`;

export const TitleContainer = styled.div`
  display: grid;
  align-items: center;
  grid-template-columns: 1fr max-content 1fr;
  padding-right: 40px;
  gap: 40px;
`;

export const Title = styled.div<{$width: number}>`
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: ${({$width}) => $width}px;
`;

export const TitleFilePath = styled.div`
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;
