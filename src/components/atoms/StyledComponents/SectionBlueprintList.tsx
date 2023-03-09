import styled from 'styled-components';

export const SectionBlueprintList = styled.ol<{$width?: number}>`
  width: ${({$width}) => ($width ? `${$width}px` : '100%')};
  height: 100%;
  list-style-type: none;
  padding: 0;
  padding-bottom: 20px;
  overflow-y: auto;
  margin: 0;
`;
