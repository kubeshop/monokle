import styled from 'styled-components';

export const TitleBarWrapper = styled.div<{$editor?: boolean; $navigator?: boolean}>`
  padding: 20px 20px 10px 20px;

  ${({$editor, $navigator}) => {
    if ($editor) {
      return `padding-bottom: 6px;`;
    }

    if ($navigator) {
      return `padding-bottom: 4px;`;
    }
  }};
`;
