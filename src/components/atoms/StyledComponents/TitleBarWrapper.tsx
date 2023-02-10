import styled from 'styled-components';

export const TitleBarWrapper = styled.div<{$closable?: boolean}>`
  display: flex;
  flex-direction: column;
  height: 100%;
  & > :first-child > div {
    padding-left: 10px;
  }

  & > :last-child {
    flex-grow: 1;
  }

  ${({$closable}) => {
    if ($closable) {
      return `padding-right: 24px;`;
    }
  }};
`;
