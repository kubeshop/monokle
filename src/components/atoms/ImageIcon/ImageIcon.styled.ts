import styled from 'styled-components';

export const StyledImageIcon = styled.img<{$height?: number; $width?: number}>`
  ${({$height, $width}) => `
    height: ${$height || '32'}px;
    width: ${$width || '32'}px;
`}
`;
