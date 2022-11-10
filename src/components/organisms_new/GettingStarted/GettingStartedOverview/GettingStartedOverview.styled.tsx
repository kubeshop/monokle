import styled from 'styled-components';

export const GettingStartedCards = styled.div`
  margin-top: 20px;
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(auto-fit, minmax(275px, 1fr));
  grid-auto-rows: 275px;
`;

export const GettingStartedResources = styled.div`
  margin-top: 40px;
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  grid-auto-rows: 180px;
`;

export const GettingStartedOverviewContainer = styled.div`
  padding: 15px;
`;

export const GettingStartedTitle = styled.h1`
  font-size: 16px;
  font-weight: 700;
  //font-family: 'Inter';
  line-height: 22px;
  letter-spacing: 0;
  text-align: left;
  margin-top: 38px;
  margin-bottom: 20px;
`;
export const GettingStartedSubTitle = styled.h1`
  letter-spacing: 0;
  text-align: left;
  margin-top: 8px;
  margin-bottom: 38px;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  //font-family: 'Inter';
  line-height: 22px;
  color: #acacac;
`;
