import styled from 'styled-components';

export const DotsContainer = styled.div`
  cursor: pointer;
`;

export const Row = styled.li<{$isHovered: boolean}>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  ${({$isHovered}) =>
    $isHovered &&
    `
    margin-bottom: 3px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  `}
`;
