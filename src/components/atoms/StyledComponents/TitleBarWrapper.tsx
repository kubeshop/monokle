import styled from 'styled-components';

export const TitleBarWrapper = styled.div<{$closable?: boolean; $navigator?: boolean}>`
  padding: 10px 16px 10px 16px;

  ${({$closable, $navigator}) => {
    if ($closable) {
      return `padding-right: 24px;`;
    }

    if ($navigator) {
      return `padding-left: 20px;`;
    }
  }};
`;
