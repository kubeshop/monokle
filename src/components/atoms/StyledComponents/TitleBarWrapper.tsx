import styled from 'styled-components';

export const TitleBarWrapper = styled.div<{$editor?: boolean; $navigator?: boolean}>`
  padding: 16px 20px 0px 16px;

  ${({$editor, $navigator}) => {
    if ($editor) {
      return `
        padding-bottom: 6px;
        padding-right: 16px;
      `;
    }

    if ($navigator) {
      return `padding-bottom: 4px;`;
    }
  }};
`;
