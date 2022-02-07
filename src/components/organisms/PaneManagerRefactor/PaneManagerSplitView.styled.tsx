import styled from 'styled-components';

export const LeftPane = styled.div`
  height: 100%;
`;

export const NavPane = styled.div`
  height: 100%;
`;

export const SplitViewContainer = styled.div`
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: repeat(2, max-content);
`;
