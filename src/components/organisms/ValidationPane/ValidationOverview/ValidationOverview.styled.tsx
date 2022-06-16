import styled from 'styled-components';

export const ValidationCards = styled.div`
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
`;

export const ValidationImg = styled.img`
  display: block;
  margin-left: auto;
  margin-right: auto;
  width: 120px;
`;

export const ValidationOverviewContainer = styled.div`
  padding: 15px;
`;

export const ValidationTitle = styled.h1`
  font-size: 16px;
  font-weight: 700;
  line-height: 22px;
  letter-spacing: 0em;
  text-align: center;
  margin-top: 8px;
  margin-bottom: 32px;
`;
