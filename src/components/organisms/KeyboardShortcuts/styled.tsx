import styled from 'styled-components';

export const ContentContainerDiv = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
  padding: 12px 24px;

  img {
    padding: 30px 0;
    display: block;
    margin: 0 auto;
  }
`;

export const HeightFillDiv = styled.div`
  display: block;
  height: 440px;
`;

export const StyledContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const StyledTextBlock = styled.table`
  display: block;
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 10px;
  overflow: hidden;
  .ant-typography {
    display: block;
  }
`;
