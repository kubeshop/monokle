import styled from 'styled-components';

export const TitleBarWrapper = styled.div<{$closable?: boolean}>`
  padding: 10px 16px 10px 16px;

  ${({$closable}) => {
    if ($closable) {
      return `padding-right: 24px;`;
    }
  }};
`;
