import styled from 'styled-components';

export const HiddenInputContainer = styled.div`
  width: 0;
  height: 0;
  overflow: hidden;
`;

export const HiddenInput = styled.input`
  opacity: 0;
`;

export const MonacoContainer = styled.div<{$height?: number}>`
  width: 100%;
  height: ${({$height}) => ($height ? `${$height}px` : '100%')};
  padding-left: 0px;
  margin: 0px;
`;
