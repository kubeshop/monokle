import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  align-items: center;
  span > span.anticon {
    font-size: 16px;
    padding: 4px;
  }
`;

export const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-left: 5px;
`;

export const ErrorText = styled.span`
  font-size: 13px;
`;
