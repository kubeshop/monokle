import styled from 'styled-components';

export const TitleBarWrapper = styled.div<{$closable?: boolean; $editor?: boolean; $navigator?: boolean}>`
  padding: 10px 16px 10px 16px;

  ${({$closable, $editor, $navigator}) => {
    if ($closable) {
      return `padding-right: 24px;`;
    }

    if ($editor) {
      return `padding-bottom: 6px;`;
    }

    if ($navigator) {
      return `padding-left: 20px; padding-bottom: 0px;`;
    }
  }};
`;
