import styled from 'styled-components';

export const NewProjectContainer = styled.div`
  display: grid;
  justify-content: center;
  align-items: center;
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  grid-auto-rows: 15rem;
  grid-column-gap: 1.1rem;
  grid-row-gap: 1.1rem;
`;
